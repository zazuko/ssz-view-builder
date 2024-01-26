import $rdf from '@view-builder/core/env.js'
import * as ns from '@view-builder/core/ns.js'
import { nanoid } from 'nanoid'

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
        'core/setContentResource': (resource) => {
          if (resource.hasType(ns.viewBuilder.ViewCollection)) {
            dispatch.viewCollection.setPointer(resource.pointer)
            dispatch.viewCollection.loadNewViewShape(resource)
          }
        },
        async loadNewViewShape(collection) {
          const {
            viewCollection: { newViewShape },
          } = store.getState()

          if (!newViewShape) {
            const operation = collection.findOperations({
              bySupportedOperation: $rdf.ns.schema.CreateAction,
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

          const collection = [...resource.representations]
            .map(([, { root }]) => root)
            .find(it => it.equals(pointer.term))
          const viewResource = collection.member.find(member => member.id.equals(deleted))

          const operation = viewResource.findOperations({
            bySupportedOperation: $rdf.ns.schema.DeleteAction,
          }).shift()

          const task = nanoid()
          dispatch.notifications.addTask(task)
          await operation.invoke()

          pointer.deleteOut($rdf.ns.hydra.member, deleted)
          dispatch.viewCollection.setPointer(pointer)

          dispatch.notifications.deleteTask(task)
          dispatch.notifications.show({
            variant: 'success',
            content: 'View deleted',
          })
        },
      }
    },
  },
}
