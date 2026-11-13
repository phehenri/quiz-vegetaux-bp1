
import { Client } from '@notionhq/client'

const notion = new Client({
  auth: process.env.NOTION_TOKEN
})

// ==================================================
// FONCTIONS DE LECTURE DES PROPRIÉTÉS NOTION
// ==================================================

function getText(property) {
  if (!property) return ''

  switch (property.type) {
    case 'title':
      return property.title
        .map(item => item.plain_text)
        .join('')

    case 'rich_text':
      return property.rich_text
        .map(item => item.plain_text)
        .join('')

    // Gestion des propriétés de type Sélection
    case 'select':
      return property.select?.name || ''

    // Gestion des propriétés de type Sélection multiple
    case 'multi_select':
      return property.multi_select
        .map(item => item.name)
        .join(', ')

    default:
      return ''
  }
}


function getMultiSelect(property) {
  if (!property) return []

  // Sélection multiple
  if (property.type === 'multi_select') {
    return property.multi_select.map(item => item.name)
  }

  // Sélection unique
  if (property.type === 'select') {
    return property.select?.name
      ? [property.select.name]
      : []
  }

  return []
}


  return property.multi_select.map(item => item.name)
}

function getPhotos(property) {
  if (!property || property.type !== 'files') {
    return []
  }

  return property.files
    .map(photo => {
      if (photo.type === 'file') {
        return photo.file?.url || null
      }

      if (photo.type === 'external') {
        return photo.external?.url || null
      }

      return null
    })
    .filter(Boolean)
}

// ==================================================
// API
// ==================================================

export default async function handler(req, res) {
  try {
    let allPages = []
    let cursor = undefined

    // Récupération de toute la base Notion
    // même lorsqu'elle dépassera 100 végétaux

    do {
      const response = await notion.dataSources.query({
        data_source_id: process.env.NOTION_DATA_SOURCE_ID,
        page_size: 100,
        ...(cursor ? { start_cursor: cursor } : {})
      })

      allPages.push(...response.results)

      cursor = response.has_more
        ? response.next_cursor
        : undefined

    } while (cursor)

    // ==================================================
    // TRANSFORMATION DES DONNÉES
    // ==================================================

    const plants = allPages.map(page => {
      const properties = page.properties

      const categories = getMultiSelect(
        properties['Categorie']
      )

      const exposition = getMultiSelect(
        properties['Exposition']
      )

      const floraison = getMultiSelect(
        properties['Mois de floraison']
      )

      const persistance = getMultiSelect(
        properties['Persistance du feuillage']
      )

      return {
        id: page.id,

        nomCommun: getText(
          properties['Nom commun']
        ),

        genre: getText(
          properties['Genre']
        ),

        espece: getText(
          properties['Espèce et Cultivar']
        ),

        // Famille : fonctionne avec Sélection (Select)
        famille: getText(
          properties['Famille']
        ),

        // On conserve toutes les catégories
        categories: categories,

        // Et une version simple pour le quiz
        categorie: categories.join(', '),

        photos: getPhotos(
          properties['Photos']
        ),

        exposition: exposition,

        floraison: floraison,

        persistance: persistance
      }
    })

    // Évite les problèmes de cache
    // pendant les modifications de la base Notion

    res.setHeader(
      'Cache-Control',
      'no-store, max-age=0'
    )

    return res.status(200).json(plants)

  } catch (error) {
    console.error('ERREUR NOTION :', error)

    return res.status(500).json({
      error:
        'Impossible de récupérer les végétaux depuis Notion.'
    })
  }
}
