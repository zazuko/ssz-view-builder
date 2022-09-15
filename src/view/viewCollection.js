import { html } from 'lit'
import { repeat } from 'lit/directives/repeat.js'
import '@shoelace-style/shoelace/dist/components/button/button.js'
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js'
import { hydra, rdfs, skos } from '@tpluscode/rdf-ns-builders'

export function content({ state, dispatch }) {
  if (state.app.view.param === '#create') {
    return 'to init view'
  }

  const views = state.core.contentResource.pointer
    .out(hydra.member)
    .toArray()
  return html`
    <sl-button @click="${() => dispatch.app.viewParam('#create')}">Create new View</sl-button>
    <table>
      <thead>
        <tr>
          <td>ID</td>
          <td>Titel</td>
          <td>MD Erfasser*in</td>
          <td>View Ersteller*in</td>
          <td></td>
        </tr>
      </thead>
      <tbody>
        ${repeat(views, view => view.value, renderRow(dispatch.routing))}
      </tbody>
    </table>
  `
}

function renderRow({ goTo }) {
  return view => html`
    <tr @click="${() => goTo(view.value)}">
      <td>${view.out(skos.notation).value}</td>
      <td>${view.out(rdfs.label).value}</td>
      <td></td>
      <td></td>
      <td>
        <sl-icon-button name="trash" label="Delete" @click="${() => alert('todo: delete')}"></sl-icon-button>
      </td>
    </tr>`
}
