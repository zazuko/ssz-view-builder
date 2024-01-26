import { html, LitElement } from 'lit'
import $rdf from '@view-builder/core/env.js'
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

    const map = this.report.out($rdf.ns.sh.result)
      .toArray()
      .reduce((previous, result) => {
        const focusNode = result.out($rdf.ns.sh.focusNode).term
        const results = previous.get(focusNode) || []
        results.push(result)
        previous.set(focusNode, results)
        return previous
      }, $rdf.termMap())

    return [...map]
  }

  render() {
    return html`${this.violations.map(this.renderFocusNodeResults.bind(this))}`
  }

  renderFocusNodeResults([focusNode, results]) {
    const grouped = results.reduce(({ warnings, violations }, result) => {
      if (result.out($rdf.ns.sh.resultSeverity).term?.equals($rdf.ns.sh.Warning)) {
        return { violations, warnings: [...warnings, result] }
      }

      return { violations: [...violations, result], warnings }
    }, {
      warnings: [], violations: [],
    })

    let errors = ''
    if (grouped.violations.length) {
      errors = html`
        <p><b>Errors:</b></p>
        <ul>
          ${grouped.violations.map(this.renderResult.bind(this))}
        </ul>
      `
    }

    let warnings = ''
    if (grouped.warnings.length) {
      warnings = html`
        <p><b>Warnings:</b></p>
        <ul>
          ${grouped.warnings.map(this.renderResult.bind(this))}
        </ul>
      `
    }

    return html`<sl-details .summary="${focusNode.value}">
      ${errors}
      ${warnings}
    </sl-details>`
  }

  // eslint-disable-next-line class-methods-use-this
  renderResult(result) {
    const property = result.out($rdf.ns.sh.sourceShape).out($rdf.ns.sh.name).value ||
    toSparql(result.out($rdf.ns.sh.resultPath)).toString({ prologue: false })

    return html`<li>${property}: ${result.out($rdf.ns.sh.resultMessage)}</li>`
  }
})
