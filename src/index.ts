import "@hydrofoil/shaperone-wc/shaperone-form.js"
import { loadShape } from './fetchShape'

const form = document.querySelector('shaperone-form')

;(async function () {
  const shape = await loadShape({
    shape: 'person'
  })

  form.shapes = shape
})()
