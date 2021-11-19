import "@hydrofoil/shaperone-wc/shaperone-form.js"
import { html, render } from '@hydrofoil/shaperone-wc'
import { loadShape } from './fetchShape'

const body = document.querySelector('body')

;(async function () {
  const shape = await loadShape({
    shape: 'person'
  })

  render(html`<shaperone-form .shapes=${shape}></shaperone-form>`, body)
})()
