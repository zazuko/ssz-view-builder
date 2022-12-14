import { css, html, LitElement } from 'lit'
import '@shoelace-style/shoelace/dist/components/spinner/spinner.js'
import '@shoelace-style/shoelace/dist/components/menu/menu.js'
import '@shoelace-style/shoelace/dist/components/menu-label/menu-label.js'
import '@shoelace-style/shoelace/dist/components/divider/divider.js'
import '@shoelace-style/shoelace/dist/components/badge/badge.js'
import '@shoelace-style/shoelace/dist/components/menu-item/menu-item.js'
import '@material/mwc-drawer/mwc-drawer.js'
import { connect } from '@captaincodeman/rdx'
import { store } from '../state/store.js'
import './ssz-notifications.js'

customElements.define('ssz-view-builder', class extends connect(store, LitElement) {
  static get styles() {
    return css`
      :host {
        display: block;
      }

      a {
        text-decoration: none;
        color: unset;
      }

      sl-menu-item a {
        display: inline-block;
        width: 100%;
      }

      div[slot=appContent] {
        padding: 0 10px;
      }

      #menu-wrapper {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }

      ssz-notifications {
        position: absolute;
        z-index: 10;
        width: 100%;
      }

      div {
         height: 100%;
      }
    `
  }

  static get properties() {
    return {
      state: { type: Object },
    }
  }

  connectedCallback() {
    store.dispatch.core.initialize()
    super.connectedCallback()
  }

  render() {
    const viewRenderParams = { state: this.state, dispatch: store.dispatch }

    return html`
      <ssz-notifications></ssz-notifications>
      <mwc-drawer>
        <div>
          <div id="menu-wrapper">
            <sl-menu>
              <sl-menu-label>View Builder</sl-menu-label>
              <sl-divider></sl-divider>
              <sl-menu-item>
                <a href="${this.state.core.entrypoint?.value}">Home</a>
              </sl-menu-item>
              ${this.state.app.view.menu
    ? html`
                  <sl-divider></sl-divider>`
    : ''}
              ${this.state.app.view.menu?.(viewRenderParams)}
              <slot name="menu"></slot>
            </sl-menu>
            <sl-menu>
              ${this.state.app.softwareComponents.map(([name, version]) => html`
                <sl-menu-item disabled>
                  ${name}
                  <sl-badge pill slot="suffix">${version}</sl-badge>
                </sl-menu-item>
              `)}
            </sl-menu>
          </div>
        </div>
        <div slot="appContent">
          ${this.state.app.view.content(viewRenderParams)}
        </div>
      </mwc-drawer>
    `
  }

  // eslint-disable-next-line class-methods-use-this
  mapState(state) {
    return {
      state,
    }
  }

  // eslint-disable-next-line class-methods-use-this
  mapEvents() {
    return {
      'show-resource': ({ detail }) => store.dispatch.routing.goTo(detail.resource),
    }
  }
})
