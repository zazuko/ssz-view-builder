import { css, html, LitElement } from 'lit'
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js'
import prefixes from '@zazuko/prefixes'
import prefixesExtras from '@zazuko/vocabulary-extras/prefixes'
import { view } from '@view-builder/core/ns.js'

const { sh, schema } = prefixes
const { cube } = prefixesExtras

export class SszShaclButton extends LitElement {
  static get styles() {
    return css`
      sl-icon-button::part(base):hover {
        color: red
      }
    `
  }

  static get properties() {
    return {
      target: { type: String },
      playgroundLink: { type: String },
      validation: { type: Object },
    }
  }

  constructor() {
    super()

    this.target = '_blank'
  }

  async updated(_changedProperties) {
    if (_changedProperties.has('validation')) {
      const { pointer, shapes, report } = this.validation

      if (!pointer || !shapes || report?.conforms === true) {
        this.playgroundLink = null
        return
      }

      try {
        const { turtle } = await import('@rdfjs-elements/formats-pretty/serializers')
        const getStream = (await import('get-stream')).default

        const serializer = await turtle({
          prefixes: { sh, schema, cube, view: view().value },
        })

        const url = new URL('https://shacl-playground.zazuko.com/')
        const dataGraph = await getStream(
          await serializer.import(this.validation.pointer.dataset.toStream()),
        )
        const shapesGraph = await getStream(
          await serializer.import(this.validation.shapes.toStream()),
        )

        const params = new URLSearchParams({
          shapesGraphFormat: 'text/turtle',
          dataGraphFormat: 'text/turtle',
          shapesGraph,
          dataGraph,
        })

        url.hash = params.toString()
        this.playgroundLink = url.toString()
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn(e)
        this.playgroundLink = null
      }
    }
  }

  render() {
    if (!this.playgroundLink) {
      return ''
    }

    return html`<sl-icon-button name="bug"
                                target="${this.target}"
                                href="${this.playgroundLink}"
                                @click="${e => e.stopPropagation()}"
                                label="Open in SHACL Playground"></sl-icon-button>`
  }
}

customElements.define('ssz-shacl-button', SszShaclButton)
