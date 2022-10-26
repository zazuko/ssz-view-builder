import { css, html, LitElement } from 'lit'
import { repeat } from 'lit/directives/repeat.js'
import { schema, vcard } from '@tpluscode/rdf-ns-builders'
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js'

customElements.define('ssz-view-table', class extends LitElement {
  static get styles() {
    return css`
      [hidden] {
        display: none;
      }
      
      .view-row {
        cursor: pointer;
      }
    `
  }

  static get properties() {
    return {
      views: { type: Array },
    }
  }

  render() {
    return html`
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
          ${repeat(this.views, view => view.value, this.renderRow.bind(this))}
          <tr ?hidden="${this.views.length > 0}">
            <td colspan="5">
              <slot name="empty"></slot>
            </td>
          </tr>
        </tbody>
      </table>
    `
  }

  renderRow(view) {
    return html`
      <tr class="view-row" @click="${() => this.dispatchEvent(new CustomEvent('view-select', { detail: { view } }))}">
        <td>${view.out(schema.alternateName).value}</td>
        <td>${view.out(schema.name).value}</td>
        <td></td>
        <td>${view.out(schema.author).out(vcard.hasName).value}</td>
        <td>
          <sl-icon-button name="trash"
                          label="Delete"
                          @click="${this.triggerDelete((view))}"></sl-icon-button>
        </td>
      </tr>`
  }

  triggerDelete(view) {
    return (e) => {
      this.dispatchEvent(new CustomEvent('view-delete', { detail: { view } }))
      e.stopPropagation()
    }
  }
})
