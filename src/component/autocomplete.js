import { html } from '@hydrofoil/shaperone-wc'
import { LitElement, css } from 'lit'
import { repeat } from 'lit/directives/repeat.js'
import "@shoelace-style/shoelace/dist/components/dropdown/dropdown.js"
import "@shoelace-style/shoelace/dist/components/input/input.js"
import "@shoelace-style/shoelace/dist/components/menu/menu.js"
import "@shoelace-style/shoelace/dist/components/menu-item/menu-item.js"
import "@shoelace-style/shoelace/dist/components/tag/tag.js"
import { localizedLabel } from '@rdfjs-elements/lit-helpers/localizedLabel.js'
import { renderItem } from './instancesSelect.js'
import { rdfs, schema } from '@tpluscode/rdf-ns-builders'
import { isNamedNode } from 'is-graph-pointer'

customElements.define('sh-sl-autocomplete', class extends LitElement {
  static get styles() {
    return css`
      :host([empty]) sl-menu {
        display: none;
      }
    `
  }

  static get properties() {
    return {
      selected: { type: Object },
      inputValue: { type: String },
      empty: { type: Boolean, reflect: true }
    }
  }

  constructor() {
    super()
    this.empty = true
  }

  render() {
    return html`<sl-dropdown @sl-hide=${stop} hoist>
      <sl-input slot="trigger" 
                .value=${this.inputValue}
                @sl-input="${this.dispatchSearch}">
        <sl-icon name="search" slot="suffix"></sl-icon>
      </sl-input>

      <sl-menu hoist .value=${this.selected?.value} 
               placeholder="Missing data!" 
               @sl-select=${this.dispatchItemSelected}>
        <slot @slotchange=${this.updateEmpty}></slot>
      </sl-menu>
    </sl-dropdown>
    `
  }
  
  updateEmpty(e) {
    this.empty = e.target.assignedElements().length === 0
  }

  dispatchSearch() {
    const input = this.renderRoot.querySelector('sl-input')
    this.dispatchEvent(new CustomEvent('search', {
      detail: {
        value: input.value,
      }
    }))
  }

  dispatchItemSelected(e) {
    this.dispatchEvent(new CustomEvent('itemSelected', {
      detail: {
        value: e.detail.item.value
      }
    }))
  }
})

export function autocomplete(params, { update }) {
  const { value } = params
  const pointers = value.componentState.instances || []
  const freetextQuery = value.componentState.freetextQuery || ''
  const selected = value.componentState.selected

  const search = (e) => {
    params.updateComponentState({
      freetextQuery: e.detail.value,
    })
  }

  const itemSelected = (e) => {
    const selected = pointers.find(({ value }) => value === e.detail.value)

    params.updateComponentState({
      freetextQuery: '',
      selected
    })
    if (selected) {
      update(selected.term)
    }
  }

  let nodeValue = value.object?.value
  if (isNamedNode(value.object)) {
    const nodeUrl = new URL(value.object.value)
    nodeValue = nodeUrl.hash || nodeUrl.pathname
  }
  const fallback = nodeValue || freetextQuery

  return html`
    <sh-sl-autocomplete .selected=${selected}
                        .inputValue=${localizedLabel(selected, { property: [schema.name, rdfs.label], fallback })}
                        @search=${search}
                        @itemSelected=${itemSelected}>
      ${repeat(pointers, renderItem)}
    </sh-sl-autocomplete>`
}

function stop(e) {
  e.stopPropagation()
}
