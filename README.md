# Examples of shaperone-form

Try also the playground at [forms.hypermedia.app](https://forms.hypermedia.app/playground)

This repo hosts examples of Shaperone. You can use it directly on the documentation pages of shaperone or on webcomponents.dev to experiment with different features.

There are multiple focused branches. The `master` branch is the baseline of plain. Each "feature branch" presents a specific use case for shaperone.

## Load shapes

Shapes are loaded directly from the web. This repository contains some samples in the `src/shapes` dir. They can be loaded in two ways

```javascript
import fetchShapes from './fetchShapes'

// 1. load from samples
//    for example <> from `src/shapes/person.ttl`
const graph = await fetchShapes('person')
const person = graph.namedNode('')

// 2. load from the web
//    defaults to node equal dereferenced URI 
const projectShape = await fetchShapes('http://example.com/project-shape')

// but a different node can be selected
const baseShape = projectShape.node('http://example.com/project-shape#base-shape')
```

## Configuration

Any per-branch configuration will happen in `src/config.js`.
