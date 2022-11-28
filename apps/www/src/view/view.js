import { html } from 'lit'
import { hydra, schema } from '@tpluscode/rdf-ns-builders'
import { isBlankNode } from 'is-graph-pointer'
import { code } from '@zazuko/vocabulary-extras/builders'
import '../element/ssz-shacl-button.js'
import '../forms/index.js'
import { fetchQuery, fetchShapes } from '../fetch.js'
import { getSparqlUrl } from '../queries/index.js'
import * as loading from './loading.js'

let shapes

export async function init({ client }) {
  shapes = shapes || await loadShapes(client)

  return {
    content,
    menu,
  }
}

function content({ state, dispatch }) {
  if (!state.viewForm.pointer) {
    return loading.content()
  }

  return html`
    <h2>${state.viewForm.pointer.out(schema.name).value || 'Unnamed view'}</h2>
    
    <shaperone-form .shapes=${shapes} 
                    .resource=${state.viewForm.pointer}
                    @changed="${dispatch.viewForm.toggleButtons}"></shaperone-form>`
}

function menu({ state, dispatch }) {
  return html`
    <sl-menu-label>View</sl-menu-label>
    <sl-menu-item @click=${dispatch.viewForm.saveView}>Save</sl-menu-item>
    <sl-menu-item ?disabled="${!state.viewForm.sourcesValidity.report.conforms}"
                  @click=${dispatch.viewForm.generateDimensions}>
      <ssz-shacl-button slot="suffix" target="sources-shacl" .validation="${state.viewForm.sourcesValidity}"></ssz-shacl-button>
      Generate dimensions
    </sl-menu-item>
    <sl-divider></sl-divider>
    <sl-menu-label>Actions</sl-menu-label>
    <sl-menu-item @click=${dispatch.viewForm.showView}>Show view</sl-menu-item>
    <sl-menu-item ?disabled="${!state.viewForm.validity.report.conforms}"
                  @click=${dispatch.viewForm.showQuery}>
      <ssz-shacl-button slot="suffix" target="view-shacl" .validation="${state.viewForm.validity}"></ssz-shacl-button>
      Show query
    </sl-menu-item>
    <sl-menu-item ?disabled="${!state.viewForm.validity.report.conforms}"
                  @click=${dispatch.viewForm.showInCubeViewer}>
      <ssz-shacl-button slot="suffix" target="view-shacl" .validation="${state.viewForm.validity}"></ssz-shacl-button>
      Show in cube viewer
    </sl-menu-item>`
}

async function loadShapes(client) {
  const graph = await fetchShapes('view')

  const templates = graph
    .any()
    .has(hydra.template)

  const queriesLoaded = templates.map(async (template) => {
    const iriTemplate = template.out(hydra.template)
    if (!isBlankNode(iriTemplate)) {
      return
    }

    const name = iriTemplate.out(code.name).value
    const query = await fetchQuery(name)
    const sparqlUrl = getSparqlUrl({ query, template, client })

    iriTemplate.deleteOut().deleteIn()
    template.addOut(hydra.template, sparqlUrl)
  })

  await Promise.all(queriesLoaded)

  return graph.namedNode('')
}
