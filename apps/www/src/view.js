import clownface from 'clownface'
import $rdf from '@rdfjs/dataset'
import View from 'rdf-cube-view-query/lib/View.js'
import * as ns from './ns.js'

export function prepareViewPointer(pointer) {
  const dataset = $rdf.dataset([...pointer.dataset])

  const view = clownface({ dataset }).node(pointer)

  view.out(ns.view.projection)
    .addList(ns.view.columns, view.out(ns.view.dimension))

  view.addOut(ns.view.dimension, view.out(ns.view.filter).out(ns.view.dimension))

  return view
}

export function createViewQuery(pointer) {
  const view = new View(pointer)

  return view.observationsQuery().query
}
