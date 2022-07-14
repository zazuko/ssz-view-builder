
import '@shoelace-style/shoelace/dist/components/select/select.js'
import '@shoelace-style/shoelace/dist/components/menu-item/menu-item.js'
import { html } from '@hydrofoil/shaperone-wc'
import { repeat } from 'lit/directives/repeat.js'

export function instancesSelect({ value }, { update }) {
  const pointers = value.componentState.instances
  const choices = pointers?.map(([c, label]) => ([
    c.term,
    label,
  ])) || []

  return select(value, choices, update)
}

export function enumSelect({ value }, { update }) {
  const choices = value.componentState.choices
  return select(value, choices, update)
}

function select(value, choices, update) {
  function onChange(e) {
    update(choices.find(([term]) => term.value === e.target.value)[0])
  }

  return html`<sl-select hoist .value=${value.object?.value} @sl-change=${onChange} @sl-hide=${stop}>
    ${repeat(choices, renderItem)}
  </sl-select>`
}

function renderItem([term, label]) {
  return html`<sl-menu-item .value=${term.value}>${label}</sl-select-item>`
}

function stop(e) {
  e.stopPropagation()
}
