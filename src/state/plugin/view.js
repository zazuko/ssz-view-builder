import { rdf } from '@tpluscode/rdf-ns-builders'
import { turtle } from '@tpluscode/rdf-string'
import $rdf from 'rdf-ext'
import clownface from 'clownface'
import { getAllTriplesFromRoot } from '../../clownface.js'
import { view } from '../../ns.js'
import { endpoint } from '../../queries/index.js'

export const viewForm = {
  model: {
    state: {},
    reducers: {
      setView(state, pointer) {
        return { ...state, pointer }
      },
    },
    effects(store) {
      const dispatch = store.getDispatch().viewForm

      return {
        async saveView() {
          const { pointer } = store.getState().viewForm
          const view = store.getState()
            .resource.representations
            .get(pointer.term)
            .root

          const saveOperation = view.findOperations({
            byMethod: 'PUT',
          }).shift()

          const body = turtle`${getAllTriplesFromRoot(pointer)}`
          await saveOperation.invoke(body, {
            'content-type': 'text/turtle',
          })

          dispatch.populateForm(pointer.term)
        },
        async generateDimensions() {
          const { generateDimensions } = await import('../../automation.js')

          const { pointer } = store.getState().viewForm

          dispatch.setView(await generateDimensions(pointer))
        },
        async showView() {
          const { prepareViewPointer } = await import('../../view.js')

          const { pointer } = store.getState().viewForm
          const view = prepareViewPointer(pointer)

          const resourceTurtle = turtle`${view.dataset}`.toString()
          const converterUrl = `https://converter.zazuko.com/#value=${encodeURIComponent(resourceTurtle)}&format=text%2Fturtle`
          window.open(converterUrl, 'converter')
        },
        async showQuery() {
          const { prepareViewPointer, createViewQuery } = await import('../../view.js')

          const { pointer } = store.getState().viewForm
          const view = prepareViewPointer(pointer)
          const query = createViewQuery(view)

          const params = new URLSearchParams({
            endpoint,
            query,
            format: 'text/turtle',
          })

          const converterUrl = new URL('https://ld.stadt-zuerich.ch/sparql/')
          converterUrl.hash = params.toString()
          window.open(converterUrl.toString(), 'yasgui')
        },
        async showInCubeViewer() {
          const { prepareViewPointer } = await import('../../view.js')

          const { pointer } = store.getState().viewForm
          const view = prepareViewPointer(pointer)
          const resourceTurtle = turtle`${view.dataset}`.toString()

          const cubeViewerUrl = `https://cubeviewerdemo.netlify.app/?endpointUrl=${encodeURIComponent(endpoint)}&view=${encodeURIComponent(resourceTurtle)}`

          window.open(cubeViewerUrl, 'cubeViewer')
        },
        'core/setContentResource': ({ pointer }) => {
          if (pointer.has(rdf.type, view.View).term) {
            dispatch.populateForm(pointer.term)
          }
        },
        async populateForm(term) {
          // first, need to retrieve a minimal representation
          const { client } = store.getState().core
          const { representation } = await client.loadResource(term.value, {
            Prefer: 'return=minimal',
          })

          let { dataset } = representation.root.pointer

          // resource retrieved from API is in a named graph.
          // we clone the triples and put them in a new dataset in the default graph
          dataset = $rdf.dataset([...dataset])
            .match(null, null, null, term)
            .map(({ subject, predicate, object }) => $rdf.quad(subject, predicate, object))

          dispatch.setView(clownface({ dataset }).node(term))
        },
      }
    },
  },
}
