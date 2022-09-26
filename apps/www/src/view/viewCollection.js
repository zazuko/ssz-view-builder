import { html } from 'lit'
import { hydra, schema } from '@tpluscode/rdf-ns-builders'
import '@shoelace-style/shoelace/dist/components/button/button.js'
import '../element/ssz-view-table.js'

export function content({ state, dispatch }) {
  if (state.app.view.param === '#create') {
    return 'to init view'
  }

  const views = state.core.contentResource.pointer
    .out(hydra.member)
    .toArray()
    .sort((l, r) => {
      const leftId = l.out(schema.identifier).value || ''
      const rightId = r.out(schema.identifier).value || ''

      return leftId.localeCompare(rightId)
    })
  return html`
    <sl-button @click="${() => dispatch.app.viewParam('#create')}">Create new View</sl-button>
    <ssz-view-table .views="${views}"
                    @view-select="${e => dispatch.routing.goTo(e.detail.view.value)}"
                    @view-delete="${e => dispatch.viewCollection.deleteView(e.detail.view)}">
      <span slot="empty">
        No views found
      </span>
    </ssz-view-table>
  `
}
