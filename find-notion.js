import { Client } from '@notionhq/client'
import 'dotenv/config'

const notion = new Client({
  auth: process.env.NOTION_TOKEN
})

try {
  const response = await notion.search({})

  console.log(`Nombre de résultats : ${response.results.length}`)

  for (const result of response.results) {
    console.log('----------------')
    console.log('Type :', result.object)
    console.log('ID :', result.id)

    if (result.object === 'database') {
      console.log(
        'Titre :',
        result.title?.map(item => item.plain_text).join('') || 'Sans titre'
      )
    }

    if (result.object === 'page') {
      console.log(
        'URL :',
        result.url
      )
    }
  }
} catch (error) {
  console.error('Erreur Notion :')
  console.error(error.message)
}