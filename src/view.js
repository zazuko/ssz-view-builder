import clownface from 'clownface'
import { rdf } from '@tpluscode/rdf-ns-builders'
import $rdf from '@rdfjs/dataset'
import View from 'rdf-cube-view-query/lib/View.js'
import * as ns from './ns.js'

export function prepareViewPointer(raw) {
  const dataset = $rdf.dataset([...raw])

  const view = clownface({ dataset })
    .has(rdf.type, ns.view.View)

  view.out(ns.view.projection)
    .addList(ns.view.columns, view.out(ns.view.dimension))

  return view
}

export function createViewQuery(pointer) {
  const view = new View(pointer)

  return view.observationsQuery().query
}
