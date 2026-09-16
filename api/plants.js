import { Client } from '@notionhq/client'

const notion = new Client({
  auth: process.env.NOTION_TOKEN
})

// ================================
// TEXTE / TITRE
// ================================

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

// ================================
// MULTI-SELECT
// ================================

function getMultiSelect(property) {
  if (!property) return []

  return (
    property.multi_select?.map(
      item => item.name
    ) || []
  )
}

// ================================
// PHOTOS
// ================================

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

// ================================
// API
// ================================

export default async function handler(req, res) {

  try {

    let allPages = []
    let cursor

    // Récupère toutes les plantes
    // même si la base dépasse 100 végétaux

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

    // ================================
    // TRANSFORMATION DES DONNÉES
    // ================================

    const plants = allPages.map(page => {

      const properties = page.properties

      const categories =
        getMultiSelect(
          properties['Categorie']
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

        // Une plante n'a normalement
        // qu'une catégorie dans ton quiz.
        categorie:
          categories[0] || '',

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
          getMultiSelect(
            properties['Persistance du feuillage']
          )

      }

    })

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