import { html } from 'lit'
import { hydra, schema } from '@tpluscode/rdf-ns-builders'
import { isBlankNode } from 'is-graph-pointer'
import { code } from '@zazuko/vocabulary-extras/builders'
import '../forms/index.js'
import { fetchQuery, fetchShapes } from '../fetch.js'
import { getSparqlUrl } from '../queries/index.js'

let shapes

export async function init() {
  shapes = shapes || await loadShapes()

  return {
    content,
    menu,
  }
}

function content({ state, dispatch }) {
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
    <sl-menu-item ?disabled="${!state.viewForm.sourcesValidity.conforms}"
                  @click=${dispatch.viewForm.generateDimensions}>Generate dimensions</sl-menu-item>
    <sl-divider></sl-divider>
    <sl-menu-label>Actions</sl-menu-label>
    <sl-menu-item ?disabled="${!state.viewForm.validityReport.conforms}"
                  @click=${dispatch.viewForm.showView}>Show view</sl-menu-item>
    <sl-menu-item ?disabled="${!state.viewForm.validityReport.conforms}"
                  @click=${dispatch.viewForm.showQuery}>Show query</sl-menu-item>
    <sl-menu-item ?disabled="${!state.viewForm.validityReport.conforms}"
                  @click=${dispatch.viewForm.showInCubeViewer}>Show in cube viewer</sl-menu-item>`
}

async function loadShapes() {
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
    const sparqlUrl = getSparqlUrl(query, template)

    iriTemplate.deleteOut().deleteIn()
    template.addOut(hydra.template, sparqlUrl)
  })

  await Promise.all(queriesLoaded)

  return graph.namedNode('')
}
