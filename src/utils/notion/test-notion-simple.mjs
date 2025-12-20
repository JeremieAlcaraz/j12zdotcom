/**
 * Test simple pour explorer l'API Notion
 */

import pkg from '@notionhq/client'
const { Client } = pkg

const NOTION_API_KEY = process.env.NOTION_API_KEY

if (!NOTION_API_KEY) {
  console.error('❌ NOTION_API_KEY manquante')
  process.exit(1)
}

const notion = new Client({ auth: NOTION_API_KEY })

console.log('\n📋 Structure de l\'API Notion Client:\n')

// Explorer databases
console.log('databases:')
for (const method of Object.keys(notion.databases)) {
  console.log(`  - databases.${method}()`)
}

// Explorer dataSources
console.log('\ndataSources:')
for (const method of Object.keys(notion.dataSources)) {
  console.log(`  - dataSources.${method}()`)
}

// Explorer pages
console.log('\npages:')
for (const method of Object.keys(notion.pages)) {
  console.log(`  - pages.${method}()`)
}

// Explorer search
console.log('\nsearch:')
console.log(`  Type: ${typeof notion.search}`)
if (typeof notion.search === 'function') {
  console.log('  - search() (fonction directe)')
} else {
  for (const method of Object.keys(notion.search)) {
    console.log(`  - search.${method}()`)
  }
}

console.log('\n💡 Pour query une database, essayer:')
console.log('   - notion.dataSources.query({ data_source_id: "..." })')
console.log('   ou')
console.log('   - notion.search({ ... })')
