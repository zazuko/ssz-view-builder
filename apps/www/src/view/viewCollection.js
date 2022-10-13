import { html } from 'lit'
import { hydra, schema } from '@tpluscode/rdf-ns-builders'
import '@shoelace-style/shoelace/dist/components/button/button.js'
import '../element/ssz-view-table.js'
import { searchForm } from './searchForm.js'

export async function init() {
  await import('../forms/index.js')

  return {
    content,
    menu,
  }
}

export function content(arg) {
  if (arg.state.app.view.param === '#create') {
    return newViewForm(arg)
  }

  return table(arg)
}

function menu({ dispatch }) {
  return html`
    <sl-menu-label>Views</sl-menu-label>
    <sl-menu-item @click=${() => dispatch.app.viewParam('#create')}>Create new view</sl-menu-item>
    <sl-menu-item @click=${() => dispatch.viewCollection.publish()}>Publish views</sl-menu-item>
  `
}

function table({ state, dispatch }) {
  const views = state.viewCollection.pointer
    ?.out(hydra.member)
    .toArray()
    .sort((l, r) => {
      const leftId = l.out(schema.identifier).value || ''
      const rightId = r.out(schema.identifier).value || ''

      return leftId.localeCompare(rightId)
    }) || []
  return html`
    ${searchForm(state.viewCollection.pointer)}
    <hr/>
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
