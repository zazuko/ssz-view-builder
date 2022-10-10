import clownface from 'clownface'
import $rdf from 'rdf-ext'
import View from 'rdf-cube-view-query/lib/View.js'
import * as ns from '@view-builder/core/ns.js'
import { createFilterDimension, generateLookupSources } from './lib/filters.js'
import { removeApiProperties, sourcesToBlankNodes } from './lib/viewGraph.js'

export function prepareViewPointer(pointer, { cleanup = true } = {}) {
  let dataset = $rdf.dataset([...pointer.dataset])
  if (cleanup) {
    dataset = dataset.filter(removeApiProperties)
    dataset = sourcesToBlankNodes(dataset)
  }

  const view = clownface({ dataset }).node(pointer)

  const filters = view.out(ns.view.filter).toArray()
  for (const filter of filters) {
    const termSetFilter = filter.has(ns.viewBuilder.filterTermSet)
    if (termSetFilter.term) {
      generateLookupSources(filter)
    } else {
      createFilterDimension(filter)
    }
  }

  view.out(ns.view.projection)
    .addList(ns.view.columns, view.out(ns.view.dimension))

  view.addOut(ns.view.dimension, view.out(ns.view.filter).out(ns.view.dimension))

  return view
}

export function createViewQuery(pointer) {
  const view = new View(pointer)

  return view.observationsQuery().query.toString()
}
