---
title: 'Découvrez les nouveautés de JCCJavaScript ES2025'
meta_title: 'Tout sur JavaScript ES2025'
description: 'Un aperçu complet des nouvelles fonctionnalités de JavaScript ES2025.'
date: 2025-06-15
image: '/img_opt/image-placeholder.png'
author: 'Jérémie Alcaraz'
categories: ['JavaScript', 'Développement Web']
tags: ['ES2025', 'Programmation']
draft: false
---

## Introduction

Chaque année, JavaScript évolue avec de nouvelles fonctionnalités passionnantes. ES2025 ne fait pas exception. Dans cet article, nous allons explorer les ajouts les plus importants qui vont changer votre façon de coder.

### `Array.prototype.unique()`

L'une des méthodes les plus attendues est enfin là ! `Array.prototype.unique()` permet de dédoublonner un tableau de manière simple et performante.

```javascript
const numbers = [1, 2, 2, 3, 4, 4, 5]
const uniqueNumbers = numbers.unique()
console.log(uniqueNumbers) // [1, 2, 3, 4, 5]
```

### Le Pipe Operator `|>`

Le _pipe operator_ est une nouvelle syntaxe qui facilite le chaînage de fonctions. Il rend le code plus lisible et plus intuitif.

```javascript
const add = (a, b) => a + b
const square = n => n * n

const result = 5 |> (n => add(n, 5)) |> square
console.log(result) // 100
```

## Conclusion

ES2025 apporte des améliorations significatives qui vont simplifier le développement en JavaScript. Adoptez ces nouveautés pour écrire un code plus propre et plus efficace.
