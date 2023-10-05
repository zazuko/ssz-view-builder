import { css, html, LitElement, render } from 'lit'
import { connect } from '@captaincodeman/rdx'
import '@shoelace-style/shoelace/dist/components/dialog/dialog.js'
import '@shoelace-style/shoelace/dist/components/icon/icon.js'
import '@shoelace-style/shoelace/dist/components/progress-bar/progress-bar.js'
import './ssz-shacl-report.js'
import { rdfs } from '@tpluscode/rdf-ns-builders'
import { store } from '../state/store.js'

export class SszNotifications extends connect(store, LitElement) {
  alerts = new Set()

  static get styles() {
    return css`
      sl-progress-bar {
        --height: 5px;
        margin-bottom: 2px;
        --sl-border-radius-pill: 0px;
        display: none;
      }
      
      sl-progress-bar[indeterminate] {
        display: block;
      }
    `
  }

  static get properties() {
    return {
      loading: { type: Boolean },
      error: { type: Object },
    }
  }

  icons = new Map([
    ['primary', 'info-circle'],
    ['success', 'check2-circle'],
    ['neutral', 'gear'],
    ['warning', 'exclamation-triangle'],
    ['danger', 'exclamation-octagon'],
  ])

  render() {
    return html`
      <sl-progress-bar ?indeterminate="${this.loading}"></sl-progress-bar>
      ${this.renderError()}
    `
  }

  mapState(state) {
    for (const [key, notification] of state.notifications.list.entries()) {
      this.show(key, notification)
    }

    return {
      error: state.notifications.error,
      loading: state.notifications.backgroundTasks.size > 0,
    }
  }

  show(key, { variant = 'neutral', content, autoHide = true }) {
    if (!this.alerts.has(key)) {
      this.alerts.add(key)
      import('@shoelace-style/shoelace/dist/components/alert/alert.js')
        .then(() => {
          const slAlert = document.createElement('sl-alert')
          slAlert.closable = true
          slAlert.variant = variant
          if (autoHide) {
            slAlert.duration = 3000
          }
          render(html`<sl-icon slot="icon" name="${this.icons.get(variant) || 'question-circle'}"></sl-icon>${content}`, slAlert)

          slAlert.addEventListener('sl-hide', (e) => {
            if (e.target !== slAlert) {
              slAlert.hide()
              return
            }
            this.alerts.delete(key)
            store.dispatch.notifications.hide(key)
          })

          this.renderRoot.append(slAlert)
          slAlert.toast()
        })
    }
  }

  renderError() {
    return html`<sl-dialog ?open="${!!this.error}"
                           .label="${this.error?.out(rdfs.comment).value || ''}"
                           @sl-after-hide="${() => store.dispatch.notifications.hideError()}">
      <ssz-shacl-report .report="${this.error}"></ssz-shacl-report>
    </sl-dialog>`
  }
}

customElements.define('ssz-notifications', SszNotifications)
