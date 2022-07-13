import { turtle } from '@tpluscode/rdf-string'
import $rdf from '@rdfjs/dataset'
import clownface from 'clownface'
import { rdf } from '@tpluscode/rdf-ns-builders'
import * as ns from './ns.js'
// import {} from 'rdf-cube-view-query'

document.getElementById('opener').addEventListener('click', () => {
  const form = document.querySelector('shaperone-form')
  const dataset = $rdf.dataset([...form.resource.dataset])
  const view = clownface({ dataset })
    .has(rdf.type, ns.view.View)

  initProjection(view)

  const resourceTurtle = turtle`${dataset}`.toString()
  const converterUrl = `https://converter.zazuko.com/#value=${encodeURIComponent(resourceTurtle)}&format=text%2Fturtle`
  window.open(converterUrl, 'shaperone')
})

function initProjection(viewPtr) {
  viewPtr
    .addOut(ns.view.projection, proj => {
      proj.addList(ns.view.columns, viewPtr.out(ns.view.dimension))
    })
}
