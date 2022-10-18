import { hydra, rdf, schema } from '@tpluscode/rdf-ns-builders'
import * as ns from '@view-builder/core/ns.js'

export const viewCollection = {
  model: {
    state: {},
    reducers: {
      setPointer(state, pointer) {
        return { ...state, pointer }
      },
      setNewViewOperation(state, newViewOperation) {
        return { ...state, newViewOperation }
      },
      setNewViewShape(state, newViewShape) {
        return { ...state, newViewShape }
      },
    },
    effects(store) {
      const dispatch = store.getDispatch()

      return {
        'core/setContentResource': ({ pointer }) => {
          if (pointer.has(rdf.type, ns.viewBuilder.ViewCollection).term) {
            dispatch.viewCollection.setPointer(pointer)
            dispatch.viewCollection.loadNewViewShape()
          }
        },
        async loadNewViewShape() {
          const {
            core,
            resource,
            viewCollection: { newViewShape },
          } = store.getState()

          if (!newViewShape) {
            const collection = resource.representations.get(core.contentResource.id).root
            const operation = collection.findOperations({
              bySupportedOperation: schema.CreateAction,
            }).shift()

            const promise = operation.expects.shift().load()

            dispatch.viewCollection.setNewViewOperation(operation)
            dispatch.viewCollection.setNewViewShape(promise)

            promise.then(({ representation }) => {
              dispatch.viewCollection.setNewViewShape(representation.root)
            })
          }
        },
        'operation/succeeded': ({ operation, response }) => {
          const {
            viewCollection: { newViewOperation },
          } = store.getState()

          if (operation === newViewOperation && response.createdResourceUri) {
            const created = response.createdResourceUri
            dispatch.routing.goTo(created)
            dispatch.notifications.show({
              variant: 'success',
              content: 'View created',
            })
          }
        },
        async deleteView({ term: deleted }) {
          const { resource, viewCollection: { pointer } } = store.getState()

          const collection = resource.representations.get(pointer.term).root
          const viewResource = collection.member.find(member => member.id.equals(deleted))

          const operation = viewResource.findOperations({
            bySupportedOperation: schema.DeleteAction,
          }).shift()

          dispatch.notifications.show({
            variant: 'primary',
            content: 'Deleting view',
          })
          await operation.invoke()

          pointer.deleteOut(hydra.member, deleted)
          dispatch.viewCollection.setPointer(pointer)

          dispatch.notifications.show({
            variant: 'success',
            content: 'View deleted',
          })
        },
      }
    },
  },
}
