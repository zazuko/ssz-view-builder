import { hydra, schema } from '@tpluscode/rdf-ns-builders'
import { newReference } from '../../clownface.js'

export const viewCollection = {
  model: {
    effects(store) {
      const dispatch = store.getDispatch()

      return {
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
