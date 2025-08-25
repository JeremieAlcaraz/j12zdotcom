# Style Guide — Component Gallery & Mocks

_Version_ : **1.0** • _Mise à jour_ : **25 août 2025** • _Auteur_ : **Codex**

---

## 0) TL;DR

- `ComponentGallery.astro` charge automatiquement les composants d'un dossier grâce à `import.meta.glob` et les affiche triés par nom.
- Chaque page `/style-guide` fournit éventuellement :
  - `demoProps` → données factices par composant,
  - `clientLoad` → liste de composants à hydrater (`client:load`),
  - `exclude` → composants à ignorer,
  - `extra` → rendus personnalisés pour les cas complexes.
- Les composants qui ne s'affichent pas correctement nécessitent un **mock** dans `demoProps` ou `extra`.

---

## 1) Identifier les composants à mocker

1. Visiter la page `/style-guide/<niveau>` en dev (`pnpm dev`).
2. Relever les composants :
   - affichés vides ou avec erreur console,
   - possédant des props obligatoires (voir la signature du composant),
   - nécessitant des enfants particuliers (ex. `Tabs` + `Tab`).
3. Décider pour chacun : simple `demoProps`, rendu `extra`, ou `exclude` si la démo n'a pas de sens.

---

## 2) Ajouter un mock simple (`demoProps`)

Dans le fichier de la page concernée, ajouter une entrée au dictionnaire `demoProps` avec le **nom du composant** comme clé.

```ts
// src/pages/style-guide/atoms.astro
const demoProps = {
  ImageMod: {
    src: 'img_opt/jeremie-hero.png',
    alt: 'Jérémie',
    width: 400,
    height: 400,
  },
}
```

Le composant sera rendu automatiquement avec ces props.

---

## 3) Cas complexes (`extra`)

Certains composants demandent une structure complète ou des enfants imbriqués.
Utiliser la prop `extra` du `ComponentGallery` pour injecter un rendu sur mesure :

```tsx
<ComponentGallery
  modules={modules}
  demoProps={demoProps}
  extra=[
    {
      name: 'Tabs',
      Component: () => (
        <Tabs>
          <Tab title="Onglet 1">Contenu 1</Tab>
          <Tab title="Onglet 2">Contenu 2</Tab>
        </Tabs>
      ),
    },
  ]
  exclude={['Tab']}
/>
```

Les composants impossibles à démo (ex. besoin de données réelles) peuvent rester dans `exclude`.

---

## 4) Hydratation côté client

Pour les composants React/Svelte nécessitant du JavaScript, ajouter leur nom dans `clientLoad` :

```tsx
const clientLoad = ['Accordion', 'Button', 'Notice']
<ComponentGallery modules={modules} demoProps={demoProps} clientLoad={clientLoad} />
```

Les composants listés recevront `client:load` **et** les attributs techniques
`client:component-path` / `client:component-export` nécessaires pour
hydrater correctement les imports dynamiques.

---

## 5) Checklist

- [ ] Le composant s'affiche dans la galerie avec des données réalistes ?
- [ ] Aucun avertissement dans la console navigateur ?
- [ ] Le composant interactif est listé dans `clientLoad` ?
- [ ] Les composants sans démo pertinente sont exclus ?

---

_Fin du document (v1.0)._
