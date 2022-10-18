import { css, html, LitElement, render } from 'lit'
import { connect } from '@captaincodeman/rdx'
import '@shoelace-style/shoelace/dist/components/icon/icon.js'
import { store } from '../state/store'

export class SszNotifications extends connect(store, LitElement) {
  alerts = new Set()

  static get styles() {
    return css`
      :host {
        display: none;
      }
    `
  }

  icons = new Map([
    ['primary', 'info-circle'],
    ['success', 'check2-circle'],
    ['neutral', 'gear'],
    ['warning', 'exclamation-triangle'],
    ['danger', 'exclamation-octagon'],
  ])

  mapState(state) {
    for (const [key, notification] of state.notifications.list.entries()) {
      this.show(key, notification)
    }

    return {}
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
}

customElements.define('ssz-notifications', SszNotifications)
