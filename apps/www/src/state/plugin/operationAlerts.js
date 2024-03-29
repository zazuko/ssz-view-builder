import $rdf from '@view-builder/core/env.js'
import { html } from 'lit'
import { hex } from '@hydrofoil/vocabularies/builders'

export const operationAlerts = {
  model: {
    state: {},
    reducers: {
      lastError(state, lastError) {
        return { ...state, lastError }
      },
    },
    effects(store) {
      const dispatch = store.getDispatch()

      return {
        'operation/failed': ({ response, error }) => {
          if (error) {
            const { pointer } = error
            dispatch.notifications.show({
              content: html`
                <strong>${pointer.out($rdf.ns.rdfs.label).value}</strong><br>
                <sl-button outline @click="${() => dispatch.notifications.errorDialog(pointer.out(hex.report))}">See details</sl-button>
              `,
              variant: 'danger',
              autoHide: false,
            })
            return
          }

          if (!response?.xhr.ok) {
            dispatch.notifications.show({
              content: html`<strong>The request failed</strong>`,
              variant: 'danger',
              autoHide: false,
            })
          }
        },
      }
    },
  },
}
