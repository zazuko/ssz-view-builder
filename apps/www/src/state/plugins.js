import * as shell from '@hydrofoil/shell'
import $rdf from '@view-builder/core/env.js'

export { viewForm } from './plugin/view.js'
export { viewCollection } from './plugin/viewCollection.js'
export { notifications } from './plugin/notifications.js'
export { viewPublishing } from './plugin/viewPublishing.js'
export { operationAlerts } from './plugin/operationAlerts.js'

export const routing = shell.routing({
  appPath: '/app',
})

export const entrypointInit = {
  model: {
    effects(store) {
      const dispatch = store.getDispatch()

      return {
        'core/setContentResource': async ({ id, pointer }) => {
          const { entrypoint } = store.getState().core
          const { representations } = store.getState().resource
          const { resource } = store.getState().routing

          const representation = representations.get(id || pointer.term) ||
            representations.get($rdf.namedNode(resource))

          const newEntrypoint = representation
            ?.root?.apiDocumentation?.getArray($rdf.ns.hydra.entrypoint)
            .shift()
          if (newEntrypoint && !newEntrypoint.equals(entrypoint)) {
            dispatch.core.setEntrypoint(newEntrypoint.pointer)
          }
        },
      }
    },
  },
}
