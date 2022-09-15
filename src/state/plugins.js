import * as shell from '@hydrofoil/shell'
import $rdf from '@rdfjs/data-model'
import { hydra } from '@tpluscode/rdf-ns-builders'
import { apiBase } from './env.js'

export { viewForm } from './plugin/view.js'

export const routing = shell.routing({
  apiBase,
  hijackOptions: {
    skipOtherOrigin: false,
  },
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
            ?.root?.apiDocumentation?.getArray(hydra.entrypoint)
            .shift()
          if (newEntrypoint && !newEntrypoint.equals(entrypoint)) {
            dispatch.core.setEntrypoint(newEntrypoint.pointer)
          }
        },
      }
    },
  },
}
