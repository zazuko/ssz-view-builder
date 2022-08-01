import '@shoelace-style/shoelace/dist/components/select/select.js'
import '@shoelace-style/shoelace/dist/components/menu-item/menu-item.js'
import { localizedLabel } from '@rdfjs-elements/lit-helpers/localizedLabel.js'
import { html } from '@hydrofoil/shaperone-wc'
import { repeat } from 'lit/directives/repeat.js'

export function instancesSelect({ value }, { update }) {
  const pointers = value.componentState.instances

  return select(value, pointers, update)
}

export function enumSelect({ value }, { update }) {
  const choices = value.componentState.choices
  return select(value, choices, update)
}

function select(value, pointers, update) {
  function onChange(e) {
    const selected = pointers.find(({ value }) => value === e.target.value)

    if (selected)
      update(selected.term)
  }

  return html`<sl-select hoist .value=${value.object?.value} @sl-change=${onChange} @sl-hide=${stop}>
    ${repeat(pointers || [], renderItem)}
  </sl-select>`
}

export function renderItem(item) {
  return html`<sl-menu-item .value=${item.value}>${localizedLabel(item, { fallback: item.value })}</sl-select-item>`
}

function stop(e) {
  e.stopPropagation()
}
