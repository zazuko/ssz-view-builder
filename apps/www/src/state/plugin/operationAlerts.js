import { rdfs } from '@tpluscode/rdf-ns-builders'
import { html } from 'lit'

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
                <strong>${pointer.out(rdfs.label).value}</strong><br>
                <sl-button outline @click="${() => dispatch.notifications.errorDialog(pointer)}">See details</sl-button>
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
