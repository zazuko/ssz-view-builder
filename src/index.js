import '@hydrofoil/shaperone-wc/shaperone-form.js'
import { fetchShapes } from './fetch'
import './config'

const form = document.querySelector('shaperone-form')

;(async function () {
  const shapes = await fetchShapes('person')

  form.shapes = shapes.namedNode('')
})()
