#!/usr/bin/env bash
# Script pour lancer le test Notion avec les variables d'environnement

set -e

# Charger les secrets
eval "$(sops -d secrets/dev.enc.env | grep -v '^#' | grep -v '^$')"

# Exporter les variables
export NOTION_API_KEY
export NOTION_NOW_DATABASE_ID

# Lancer le test
node test-notion.mjs
