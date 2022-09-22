import { hydra, rdf, schema } from '@tpluscode/rdf-ns-builders'
import { newReference } from '../../clownface.js'
import * as ns from '../../ns.js'

export const viewCollection = {
  model: {
    state: {},
    reducers: {
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
          }
        },
        async deleteView(pointer) {
          const { resource, core } = store.getState()

          const collection = resource.representations.get(core.contentResource.id).root
          const viewResource = collection.member.find(member => member.id.equals(pointer.term))

          const operation = viewResource.findOperations({
            bySupportedOperation: schema.DeleteAction,
          }).shift()

          await operation.invoke()

          core.contentResource.pointer.deleteOut(hydra.member, pointer)
          dispatch.core.setContentResource({
            pointer: newReference(core.contentResource.pointer),
          })
        },
      }
    },
  },
}
