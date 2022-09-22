import { html } from 'lit'
import { hydra } from '@tpluscode/rdf-ns-builders'
import '@shoelace-style/shoelace/dist/components/button/button.js'
import '../element/ssz-view-table.js'

export function content(arg) {
  if (arg.state.app.view.param === '#create') {
    return newViewForm(arg)
  }

  return table(arg)
}

function table({ state, dispatch }) {
  const views = state.core.contentResource.pointer
    .out(hydra.member)
    .toArray()
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

function newViewForm({ state, dispatch }) {
  import('../forms/index.js')

  const { newViewShape, newViewOperation } = state.viewCollection
  if (!newViewShape || newViewShape instanceof Promise) {
    return html`<sl-spinner></sl-spinner>`
  }

  function createView(e) {
    dispatch.operation.invoke({
      operation: newViewOperation,
      payload: e.currentTarget.resource,
    })
  }

  return html`
    <shaperone-form .shapes="${newViewShape.pointer}" @submit="${createView}">
      <sl-button slot="buttons" @click="${e => e.target.dispatchEvent(new Event('submit', { bubbles: true }))}">
        ${newViewOperation.title}
      </sl-button>
    </shaperone-form>
  `
}
