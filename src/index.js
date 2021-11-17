import "@hydrofoil/shaperone-wc/shaperone-form"
import { html, render } from "lit"
import { loadShape } from './localShape.js'

const body = document.querySelector('body')

;(async function () {
  const shape = await loadShape()

  render(html`<shaperone-form .shapes=${shape}></shaperone-form>`, body)
})()
