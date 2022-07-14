
import '@shoelace-style/shoelace/dist/components/select/select.js'
import '@shoelace-style/shoelace/dist/components/menu-item/menu-item.js'
import { html } from '@hydrofoil/shaperone-wc'
import { repeat } from 'lit/directives/repeat.js'

export default function ({ value }) {
  const pointers = value.componentState.instances
  const choices = pointers?.map(([c, label]) => ({
    term: c.term,
    label,
  })) || []

  return html`<sl-select .value=${value.object?.value}>
    ${repeat(choices, renderItem)}
  </sl-select>`
}

function renderItem({term, label}) {
  return html`<sl-menu-item .value=${term.value}>${label}</sl-select-item>`
}