# Plan de Nettoyage des Shortcodes

## Objectif
Éliminer la duplication des composants shortcodes en supprimant les wrappers `.astro` redondants et en utilisant directement les composants `.tsx`.

## État actuel
- ✅ 7 fichiers dans `src/components/shortcodes/` (uniquement `.tsx`)
- ✅ Plus de duplication ni de confusion
- ✅ Utilisation cohérente des composants React

## Plan d'action

### Phase 1 : Mise à jour des usages existants
1. ✅ Identifier tous les endroits qui utilisent les wrappers `.astro`
2. ✅ Mettre à jour `src/pages/style-guide/shortcodes-mdx.astro` pour utiliser les `.tsx`
3. ✅ Vérifier que les composants MDX fonctionnent toujours

### Phase 2 : Suppression des wrappers
4. ✅ Supprimer tous les fichiers `.astro` redondants dans `src/components/shortcodes/`
5. ✅ Vérifier que le build fonctionne toujours

### Phase 3 : Validation
6. ✅ Tester le build complet
7. ⏳ Tester les composants MDX via serveur de développement
8. ⏳ Mettre à jour la documentation

## Fichiers modifiés

### ✅ Mis à jour
- `src/pages/style-guide/shortcodes-mdx.astro` : utilise maintenant directement les composants `.tsx`

### ✅ Supprimés
- `src/components/shortcodes/Accordion.astro`
- `src/components/shortcodes/Button.astro`  
- `src/components/shortcodes/Notice.astro`
- `src/components/shortcodes/Tab.astro`
- `src/components/shortcodes/Tabs.astro`
- `src/components/shortcodes/Video.astro`
- `src/components/shortcodes/Youtube.astro`

### ✅ Conservés intacts
- Tous les fichiers `.tsx` (logique métier réelle)
- Configuration AutoImport dans `astro.config.ts`

## Résultats

### ✅ Bénéfices obtenus
- ✅ Réduction de 50% du nombre de fichiers shortcodes (14 → 7)
- ✅ Élimination de la confusion sur quel fichier utiliser
- ✅ Simplification de la maintenance
- ✅ Architecture plus claire et cohérente
- ✅ Aucune régression détectée lors du build

### ✅ Validations effectuées
- ✅ `npx astro check` : 0 erreurs, même nombre de warnings qu'avant
- ✅ `npx astro build` : succès complet
- ✅ Réduction du nombre de fichiers total de 79 → 72

## Prochaines étapes
- ⏳ Test manuel du style guide via navigateur
- ⏳ Validation des composants MDX dans le contenu
- ⏳ Mise à jour de la documentation utilisateur