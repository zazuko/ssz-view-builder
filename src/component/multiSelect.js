import { html } from '@hydrofoil/shaperone-wc'
import { repeat } from 'lit/directives/repeat.js'
import { difference } from '@ngard/tiny-difference'
import '@shoelace-style/shoelace/dist/components/select/select.js'
import '@shoelace-style/shoelace/dist/components/menu-item/menu-item.js'
import '@shoelace-style/shoelace/dist/components/button/button.js'
import { renderItem } from './instancesSelect.js'
import { stop } from './eventHelpers.js'

export function multiSelect({ property, componentState }, { update }) {
  const values = property.objects.map(o => o.object?.value).filter(Boolean)
  const pointers = componentState.instances || []

  function onChange(e) {
    if (difference(e.target.value, values).length !== 0) {
      const selected = pointers
        .filter(({ value }) => e.target.value.includes(value))
        .map(({ term }) => term)

      update(selected)
    }
  }

  function selectAll() {
    const all = pointers.map(({ term }) => term)
    update(all)
  }

  return html`<sl-select hoist multiple clearable .value=${values} @sl-hide=${stop} @sl-change=${onChange}>
      ${repeat(pointers || [], renderItem)}
  </sl-select>
  <sl-button @click=${selectAll}>
    Select all
  </sl-button>`
}
