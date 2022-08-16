import { html } from '@hydrofoil/shaperone-wc'
import { repeat } from 'lit/directives/repeat.js'
import "@shoelace-style/shoelace/dist/components/dropdown/dropdown.js"
import "@shoelace-style/shoelace/dist/components/input/input.js"
import "@shoelace-style/shoelace/dist/components/menu/menu.js"
import "@shoelace-style/shoelace/dist/components/menu-item/menu-item.js"
import "@shoelace-style/shoelace/dist/components/tag/tag.js"
import { localizedLabel } from '@rdfjs-elements/lit-helpers/localizedLabel.js'
import { renderItem } from './instancesSelect.js'
import { rdfs, schema } from '@tpluscode/rdf-ns-builders'

export function autocomplete(params, { update }) {
  const { value } = params
  const pointers = value.componentState.instances || []
  const freetextQuery = value.componentState.freetextQuery || ''
  const selected = value.componentState.selected

  const search = (e) => {
    const [input] = e.composedPath()
    params.updateComponentState({
      freetextQuery: input.value,
    })
  }

  const itemSelected = (e) => {
    const selected = pointers.find(({ value }) => value === e.detail.item.value)

    params.updateComponentState({
      freetextQuery: '',
      selected
    })
    if (selected) {
      update(selected.term)
    }
  }

  return html`
    <sl-dropdown @sl-hide=${stop} hoist>
      <sl-input slot="trigger" 
                .value=${localizedLabel(selected, { property: [schema.name, rdfs.label], fallback: freetextQuery })}
                @sl-input="${search}">
        <sl-icon name="search" slot="suffix"></sl-icon>
      </sl-input>

      <sl-menu hoist .value=${value.object?.value} placeholder="Missing data!" @sl-select=${itemSelected}>
        ${repeat(pointers, renderItem)}
      </sl-menu>
    </sl-dropdown>`
}

function stop(e) {
  e.stopPropagation()
}
