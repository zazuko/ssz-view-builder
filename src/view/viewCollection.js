import { html } from 'lit'
import { hydra } from '@tpluscode/rdf-ns-builders'
import '@shoelace-style/shoelace/dist/components/button/button.js'
import '../element/ssz-view-table.js'

export function content({ state, dispatch }) {
  if (state.app.view.param === '#create') {
    return 'to init view'
  }

  const views = state.core.contentResource.pointer
    .out(hydra.member)
    .toArray()
  return html`
    <sl-button @click="${() => dispatch.app.viewParam('#create')}">Create new View</sl-button>
    <ssz-view-table .views="${views}"
                    @view-select="${e => dispatch.routing.goTo(e.detail.view.value)}"
                    @view-delete="${e => alert(`delete ${e.detail.view.value}`)}">
    </ssz-view-table>
  `
}
