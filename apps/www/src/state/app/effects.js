import $rdf from '@rdfjs/data-model'
import { rdf } from '@tpluscode/rdf-ns-builders'
import TermSet from '@rdfjs/term-set'
import url from 'url-state'
import * as ns from '@view-builder/core/ns.js'
import * as loading from '../../view/loading.js'

export default function effects(store) {
  const dispatch = store.getDispatch()

  url.addEventListener('change', () => {
    if (!url.hash) {
      dispatch.app.viewParam()
    }
  })

  return {
    'core/clientReady': (Hydra) => {
      // eslint-disable-next-line no-param-reassign
      Hydra.defaultRequestInit = ({ uri }) => {
        const { host } = new URL(uri)
        if (host === url.host) {
          return {
            credentials: 'include',
          }
        }

        return {}
      }

      const { resource } = store.getState().routing
      dispatch.resource.load(resource)
    },
    'resource/load': () => {
      dispatch.app.showView(loading)
    },
    'resource/succeeded': ({ id, representation }) => {
      const { resource } = store.getState().routing
      if (id.value === resource && representation?.root) {
        dispatch.core.setContentResource({
          id: $rdf.namedNode(resource),
          pointer: representation.root.pointer,
        })
      }
    },
    'core/setContentResource': async ({ pointer }) => {
      let view

      const types = new TermSet(pointer.out(rdf.type).terms)
      if (types.has(ns.viewBuilder.ViewCollection)) {
        view = await import('../../view/viewCollection.js')
      } else if (types.has(ns.view.View)) {
        view = await import('../../view/view.js')
      } else {
        view = {
          content: () => 'Unrecognized resource',
        }
      }

      if ('init' in view) {
        view = await view.init()
      }

      dispatch.app.showView(({ ...view, param: url.hash }))
    },
    viewParam(hash) {
      if (!url.hash && !hash) return
      if (url.hash === hash) return

      url.push({
        hash,
      })
    },
  }
}
