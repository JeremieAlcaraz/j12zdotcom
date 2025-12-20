/**
 * Script de test pour vérifier la connexion Notion
 * Usage: node test-notion.mjs
 */

import pkg from '@notionhq/client'
const { Client } = pkg

// Charger les variables d'environnement depuis le shell
const NOTION_API_KEY = process.env.NOTION_API_KEY
const NOTION_NOW_DATABASE_ID = process.env.NOTION_NOW_DATABASE_ID

console.log('🔍 Test de connexion Notion...\n')

// Vérifier que les variables sont présentes
if (!NOTION_API_KEY) {
  console.error('❌ NOTION_API_KEY non trouvée dans l\'environnement')
  console.log('💡 Assurez-vous que direnv est activé: direnv reload')
  process.exit(1)
}

if (!NOTION_NOW_DATABASE_ID) {
  console.error('❌ NOTION_NOW_DATABASE_ID non trouvée dans l\'environnement')
  console.log('💡 Assurez-vous que direnv est activé: direnv reload')
  process.exit(1)
}

console.log('✅ Variables d\'environnement chargées')
console.log(`   API Key: ${NOTION_API_KEY.substring(0, 20)}...`)
console.log(`   Database ID: ${NOTION_NOW_DATABASE_ID}\n`)

// Créer le client
const notion = new Client({ auth: NOTION_API_KEY })

// Debug: vérifier la structure complète
console.log('🔍 Toutes les clés du client:', Object.keys(notion))
console.log('🔍 databases:', Object.keys(notion.databases))
console.log('🔍 Cherche query...')
for (const key of Object.keys(notion)) {
  const obj = notion[key]
  if (obj && typeof obj === 'object' && 'query' in obj) {
    console.log(`   → Trouvé 'query' dans: notion.${key}`)
  }
}

try {
  console.log('📡 Connexion à la database Notion...')

  const response = await notion.dataSources.query({
    data_source_id: NOTION_NOW_DATABASE_ID,
    sorts: [
      {
        property: 'created_time',
        direction: 'descending',
      },
    ],
    page_size: 5,
  })

  console.log(`✅ Connexion réussie ! ${response.results.length} entrée(s) trouvée(s)\n`)

  // Afficher les résultats
  response.results.forEach((page, index) => {
    if ('properties' in page) {
      const nom = page.properties.nom?.title?.[0]?.plain_text || 'Sans nom'
      const statut = page.properties.statut?.select?.name || 'Pas de statut'
      const learning = page.properties.learning?.rich_text
        ?.map((t) => t.plain_text)
        .join('') || 'Vide'

      console.log(`${index + 1}. ${nom}`)
      console.log(`   Statut: ${statut}`)
      console.log(`   Learning: ${learning}`)
      console.log('')
    }
  })

  console.log('🎉 Test terminé avec succès !')
} catch (error) {
  console.error('\n❌ Erreur lors de la connexion:')
  console.error('Type:', typeof error)
  console.error('Error object:', error)
  console.error('Stack:', error.stack)

  if (error.code === 'unauthorized') {
    console.error('   → Clé API invalide. Vérifiez votre NOTION_API_KEY')
  } else if (error.code === 'object_not_found') {
    console.error('   → Database introuvable. Vérifiez que:')
    console.error('      1. L\'ID de la database est correct')
    console.error('      2. L\'intégration a accès à la database (Add connections)')
  } else if (error.cause) {
    console.error('   → Cause:', error.cause)
    console.error('   → Message:', error.message)
  } else {
    console.error('   →', error.message)
  }

  process.exit(1)
}
