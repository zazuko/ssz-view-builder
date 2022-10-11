import clownface from 'clownface'
import $rdf from 'rdf-ext'
import View from 'rdf-cube-view-query/lib/View.js'
import * as ns from '@view-builder/core/ns.js'
import { createFilterDimension, generateLookupSources } from './lib/filters.js'
import { removeApiProperties, sourcesToBlankNodes } from './lib/viewGraph.js'

export function prepareViewPointer(pointer, { cleanup = true, removeLimitOffset } = {}) {
  let dataset = $rdf.dataset([...pointer.dataset])
  if (cleanup) {
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

  const projection = view.out(ns.view.projection)
  projection.addList(ns.view.columns, view.out(ns.view.dimension))

  if (removeLimitOffset) {
    projection.deleteOut([ns.view.limit, ns.view.offset])
  }

  view.addOut(ns.view.dimension, view.out(ns.view.filter).out(ns.view.dimension))

  if (cleanup) {
    dataset = dataset.filter(removeApiProperties)
  }

  return clownface({ dataset }).node(pointer)
}

export function createViewQuery(pointer) {
  const view = new View(pointer)

  return view.observationsQuery().query.toString()
}
