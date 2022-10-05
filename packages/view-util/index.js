import clownface from 'clownface'
import $rdf from '@rdfjs/dataset'
import View from 'rdf-cube-view-query/lib/View.js'
import * as ns from '@view-builder/core/ns.js'
import { createFilterDimension, generateLookupSources } from './lib/filters.js'
import { getColumns } from './lib/projection.js'
import { CubeLookup } from './lib/cubeLookup.js'

export async function prepareViewPointer(pointer, { client, cubeLookup = new CubeLookup(client) }) {
  const dataset = $rdf.dataset([...pointer.dataset])

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

  const columns = [...await getColumns(view, cubeLookup)]
  view.addOut(ns.view.dimension, columns)
  view.out(ns.view.projection)
    .addList(ns.view.columns, columns)

  view.addOut(ns.view.dimension, view.out(ns.view.filter).out(ns.view.dimension))

  return view
}

export function createViewQuery(pointer) {
  const view = new View(pointer)

  return view.observationsQuery().query.toString()
}
