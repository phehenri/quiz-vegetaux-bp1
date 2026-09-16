import { Client } from '@notionhq/client'

const notion = new Client({
  auth: process.env.NOTION_TOKEN
})

// ========================================
// TEXTE / TITRE
// ========================================

function getText(property) {
  if (!property) return ''

  if (property.type === 'title') {
    return property.title
      .map(item => item.plain_text)
      .join('')
  }

  if (property.type === 'rich_text') {
    return property.rich_text
      .map(item => item.plain_text)
      .join('')
  }

  return ''
}

// ========================================
// SELECT
// ========================================

function getSelect(property) {
  if (!property) return ''

  return property.select?.name || ''
}

// ========================================
// MULTI SELECT
// ========================================

function getMultiSelect(property) {
  if (!property) return []

  return property.multi_select?.map(
    item => item.name
  ) || []
}

// ========================================
// PHOTOS
// ========================================

function getPhotos(property) {
  if (!property?.files) return []

  return property.files
    .map(photo => {

      if (photo.type === 'file') {
        return photo.file?.url
      }

      if (photo.type === 'external') {
        return photo.external?.url
      }

      return null
    })
    .filter(Boolean)
}

// ========================================
// API
// ========================================

export default async function handler(req, res) {

  try {

    let allPages = []
    let cursor

    // Récupération de toutes les plantes
    // (pagination si la base dépasse 100 plantes)

    do {

      const response =
        await notion.dataSources.query({

          data_source_id:
            process.env.NOTION_DATA_SOURCE_ID,

          page_size: 100,

          ...(cursor && {
            start_cursor: cursor
          })

        })

      allPages.push(...response.results)

      cursor = response.has_more
        ? response.next_cursor
        : undefined

    } while (cursor)

    // ========================================
    // TRANSFORMATION DES DONNÉES NOTION
    // ========================================

    const plants = allPages.map(page => {

      const properties = page.properties

      // TEMPORAIRE :
      // permet de voir exactement comment Notion
      // renvoie ces deux propriétés dans Vercel Logs

      console.log(
        'CATEGORIE NOTION:',
        JSON.stringify(
          properties['Catégorie'],
          null,
          2
        )
      )

      console.log(
        'ESPECE NOTION:',
        JSON.stringify(
          properties["Espèce et 'Cultivar'"],
          null,
          2
        )
      )

      return {

        id: page.id,

        nomCommun:
          getText(
            properties['Nom commun']
          ),

        genre:
          getText(
            properties['Genre']
          ),

        espece:
          getText(
            properties['Espèce et Cultivar']
          ),

        famille:
          getText(
            properties['Famille']
          ),

        categorie:
          getSelect(
            properties['Catégorie']
          ),

        photos:
          getPhotos(
            properties['Photos']
          ),

        exposition:
          getMultiSelect(
            properties['Exposition']
          ),

        floraison:
          getMultiSelect(
            properties['Mois de floraison']
          ),

        persistance:
          getSelect(
            properties['Persistance du feuillage']
          )

      }

    })

    // ========================================
    // RÉPONSE JSON
    // ========================================

    res.status(200).json(plants)

  } catch (error) {

    console.error(
      'ERREUR NOTION:',
      error
    )

    res.status(500).json({
      error:
        'Impossible de récupérer les végétaux depuis Notion.'
    })

  }

}