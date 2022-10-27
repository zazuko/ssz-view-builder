import { html, LitElement } from 'lit'
import TermMap from '@rdfjs/term-map'
import { sh } from '@tpluscode/rdf-ns-builders'
import '@shoelace-style/shoelace/dist/components/details/details.js'
import { toSparql } from 'clownface-shacl-path'

customElements.define('ssz-shacl-report', class extends LitElement {
  static get properties() {
    return {
      report: { type: Object },
    }
  }

  constructor() {
    super()

    this.addEventListener('sl-after-hide', e => e.stopPropagation())
  }

  get violations() {
    if (!this.report) {
      return []
    }

    const map = this.report.out(sh.result)
      .toArray()
      .reduce((previous, result) => {
        const focusNode = result.out(sh.focusNode).term
        const results = previous.get(focusNode) || []
        results.push(result)
        previous.set(focusNode, results)
        return previous
      }, new TermMap())

    return [...map]
  }

  render() {
    return html`${this.violations.map(this.renderFocusNodeResults.bind(this))}`
  }

  renderFocusNodeResults([focusNode, results]) {
    return html`<sl-details .summary="${focusNode.value}">
      <ul>
        ${results.map(this.renderResult.bind(this))}
      </ul>
    </sl-details>`
  }

  // eslint-disable-next-line class-methods-use-this
  renderResult(result) {
    const property = result.out(sh.sourceShape).out(sh.name).value ||
    toSparql(result.out(sh.resultPath)).toString({ prologue: false })

    return html`<li>${property}: ${result.out(sh.resultMessage)}</li>`
  }
})
