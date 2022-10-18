import { rdf } from '@tpluscode/rdf-ns-builders'
import * as ns from '@view-builder/core/ns.js'
import { viewBuilder } from '@view-builder/core/ns.js'
import { parse } from 'content-disposition'

export const viewPublishing = {
  model: {
    state: {},
    reducers: {
      setOperation(state, { shape, operation }) {
        return { ...state, shape, operation }
      },
    },
    effects(store) {
      const dispatch = store.getDispatch()

      return {
        'core/setContentResource': ({ pointer }) => {
          if (pointer.has(rdf.type, ns.viewBuilder.ViewCollection).term) {
            dispatch.viewPublishing.preparePublishOperation()
          }
        },
        preparePublishOperation() {
          const {
            core,
            resource,
            viewCollection: { publishShape },
          } = store.getState()

          if (!publishShape) {
            const collection = resource.representations.get(core.contentResource.id).root
            const publishResource = collection.get(viewBuilder.publish)

            const operation = publishResource.findOperations({
              bySupportedOperation: viewBuilder.PublishAction,
            }).shift()
            const shape = operation.expects.shift().pointer

            dispatch.viewPublishing.setOperation({ shape, operation })
          }
        },
        invokeOperation(payload) {
          const {
            viewPublishing: { operation },
          } = store.getState()

          dispatch.operation.invoke({ operation, payload })
        },
        'operation/succeeded': async (succeeded) => {
          const {
            viewPublishing: { operation },
            viewCollection: { pointer: views },
          } = store.getState()

          if (operation === succeeded.operation) {
            dispatch.routing.goTo(views.term.value)
          }

          const { xhr } = succeeded.response
          if (xhr.headers.has('content-disposition')) {
            const contentDisposition = parse(xhr.headers.get('content-disposition'))

            const blob = new Blob([await xhr.blob()], { type: 'application/n-triples' })

            const objUrl = window.URL.createObjectURL(blob)

            const link = document.createElement('a')
            link.href = objUrl
            link.download = contentDisposition.parameters.filname || 'views.nt'
            link.click()

            // For Firefox it is necessary to delay revoking the ObjectURL.
            setTimeout(() => { window.URL.revokeObjectURL(objUrl) }, 250)
          }

          dispatch.notifications.show({
            variant: 'success',
            content: 'Publishing complete',
          })
        },
      }
    },
  },
}
