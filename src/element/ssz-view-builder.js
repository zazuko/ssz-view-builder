import { css, html, LitElement } from 'lit'
import '@shoelace-style/shoelace/dist/components/spinner/spinner.js'
import '@shoelace-style/shoelace/dist/components/menu/menu.js'
import '@shoelace-style/shoelace/dist/components/menu-label/menu-label.js'
import '@shoelace-style/shoelace/dist/components/divider/divider.js'
import '@material/mwc-drawer/mwc-drawer.js'
import { turtle } from '@tpluscode/rdf-string'
import { hydra, schema } from '@tpluscode/rdf-ns-builders'
import { code } from '@zazuko/vocabulary-extras/builders'
import { isBlankNode } from 'is-graph-pointer'
import { fetchShapes, fetchQuery } from '../fetch'
import { getSparqlUrl, endpoint } from '../queries/index.js'

customElements.define('ssz-view-builder', class extends LitElement {
  static get styles() {
    return css`
      :host {
        display: block
      }
    `
  }

  static get properties() {
    return {
      ready: { type: Boolean, reflect: true },
      shapes: { type: Object },
      resource: { type: Object },
      viewsUrl: { type: String, attribute: 'views-url' },
    }
  }

  get form() {
    return this.renderRoot.querySelector('shaperone-form')
  }

  connectedCallback() {
    super.connectedCallback()

    Promise.all([
      import('./ssz-view-builder.deps.js'),
      this.loadShapes(),
    ]).then(async ([{ Hydra }]) => {
      Hydra.defaultRequestInit = {
        credentials: 'include',
      }
      this.api = Hydra

      const { representation } = await Hydra.loadResource(this.viewsUrl)
      this.viewsCollection = representation?.root

      this.ready = true
    })
  }

  render() {
    return html`
      <mwc-drawer>
        <div>
          <sl-menu>
            <sl-menu-label>View Builder</sl-menu-label>
            <sl-divider></sl-divider>
            <sl-menu-label>Current view</sl-menu-label>
            <sl-menu-item @click=${this.saveView}>Save</sl-menu-item>
            <sl-menu-item @click=${this.generateDimensions}>Generate dimensions</sl-menu-item>
            <sl-divider></sl-divider>
            <sl-menu-label>Actions</sl-menu-label>
            <sl-menu-item @click=${this.showView}>Show view</sl-menu-item>
            <sl-menu-item @click=${this.showQuery}>Show query</sl-menu-item>
            <sl-menu-item @click=${this.showInCubeViewer}>Show in cube viewer</sl-menu-item>
            <slot name="menu"></slot>
          </sl-menu>
        </div>
        <div slot="appContent">
          ${this.ready ? this.renderForm() : html`<sl-spinner></sl-spinner>`}
        </div>
    </mwc-drawer>
    `
  }

  renderForm() {
    return html`<shaperone-form .shapes=${this.shapes} .resource=${this.resource}></shaperone-form>`
  }

  async saveView() {
    let saveOperation

    if (!this.view) {
      saveOperation = this.viewsCollection.findOperations({
        bySupportedOperation: schema.CreateAction,
      }).shift()
    } else {
      saveOperation = this.view.findOperations({
        byMethod: 'PUT',
      }).shift()
    }

    const body = this.form.value.toJSON()
    const { response, representation } = await saveOperation.invoke(JSON.stringify(body), {
      'content-type': 'application/ld+json',
    })

    if (!this.view) {
      if (response.xhr.ok && response.xhr.headers.has('location')) {
        const id = response.xhr.headers.get('location')
        const created = await this.api.loadResource(id)
        this.view = created.representation.root
        this.resource = created.representation.root.pointer
      }
    } else {
      this.view = representation.root
      this.resource = representation.root.pointer
    }
  }

  async loadShapes() {
    const shapes = await fetchShapes('view')

    const templates = shapes
      .any()
      .has(hydra.template)

    const queriesLoaded = templates.map(async template => {
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

    this.shapes = shapes.namedNode('')
  }

  async generateDimensions() {
    const { generateDimensions } = await import('../automation.js')

    const view = this.form.resource

    this.resource = await generateDimensions(view)
  }

  async showView() {
    const { prepareViewPointer } = await import('../view.js')

    const view = prepareViewPointer(this.form.resource.dataset)

    const resourceTurtle = turtle`${view.dataset}`.toString()
    const converterUrl = `https://converter.zazuko.com/#value=${encodeURIComponent(resourceTurtle)}&format=text%2Fturtle`
    window.open(converterUrl, 'converter')
  }

  async showQuery() {
    const { prepareViewPointer, createViewQuery } = await import('../view.js')

    const view = prepareViewPointer(this.form.resource.dataset)
    const query = createViewQuery(view)

    const params = new URLSearchParams({
      endpoint,
      query,
      format: 'text/turtle',
    })

    const converterUrl = new URL('https://ld.stadt-zuerich.ch/sparql/')
    converterUrl.hash = params.toString()
    window.open(converterUrl.toString(), 'yasgui')
  }

  async showInCubeViewer() {
    const { prepareViewPointer } = await import('../view.js')

    const view = prepareViewPointer(this.form.resource.dataset)
    const resourceTurtle = turtle`${view.dataset}`.toString()

    const cubeViewerUrl = `https://cubeviewerdemo.netlify.app/?endpointUrl=${encodeURIComponent(endpoint)}&view=${encodeURIComponent(resourceTurtle)}`

    window.open(cubeViewerUrl, 'cubeViewer')
  }
})
