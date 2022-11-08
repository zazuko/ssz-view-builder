import { rdf } from '@tpluscode/rdf-ns-builders'
import { turtle } from '@tpluscode/rdf-string'
import $rdf from 'rdf-ext'
import clownface from 'clownface'
import * as ns from '@view-builder/core/ns.js'
import { nanoid } from 'nanoid'
import { getAllTriplesFromRoot } from '../../clownface.js'
import { client, endpoint } from '../../queries/index.js'
import toggleButtons from './viewForm/toggleButtons.js'
import { multiEffect } from '../lib/multiEffect.js'

export const viewForm = {
  model: {
    state: {
      validityReport: {},
      sourcesValidity: {},
    },
    reducers: {
      setView(state, pointer) {
        return { ...state, pointer }
      },
      clearView(state) {
        if (!('pointer' in state)) return state

        const { pointer, ...rest } = state
        return rest
      },
      setSaveOperation(state, saveOperation) {
        return { ...state, saveOperation }
      },
      setSourcesValidity(state, report) {
        return { ...state, sourcesValidity: report }
      },
      setViewValidity(state, validityReport) {
        return { ...state, validityReport }
      },
    },
    effects(store) {
      const dispatch = store.getDispatch()

      return {
        async saveView() {
          const { pointer, saveOperation } = store.getState().viewForm

          const dataset = $rdf.dataset([...getAllTriplesFromRoot(pointer)])
          const payload = clownface({ dataset }).node(pointer)
          dispatch.operation.invoke({
            operation: saveOperation,
            payload,
          })
        },
        'operation/succeeded': ({ operation }) => {
          const { pointer, saveOperation } = store.getState().viewForm

          if (operation === saveOperation) {
            dispatch.notifications.show({
              variant: 'success',
              content: 'View saved',
            })

            dispatch.viewForm.populateForm(pointer.term)
          }
        },
        async generateDimensions() {
          const { generateDimensions } = await import('../../automation.js')

          const { pointer } = store.getState().viewForm

          const task = nanoid()
          dispatch.notifications.addTask(task)
          const updatedView = await generateDimensions(pointer)
          dispatch.viewForm.setView(updatedView)

          const count = updatedView.any().has(ns.viewBuilder.generated, true).terms.length
          dispatch.notifications.deleteTask(task)
          dispatch.notifications.show({
            variant: 'success',
            content: `${count} dimension(s) generated`,
          })
        },
        async showView() {
          const { prepareViewPointer } = await import('@view-builder/view-util')

          const { pointer } = store.getState().viewForm
          const view = await prepareViewPointer(pointer, { client })

          const resourceTurtle = turtle`${view.dataset}`.toString()
          const converterUrl = `https://converter.zazuko.com/#value=${encodeURIComponent(resourceTurtle)}&format=text%2Fturtle`
          window.open(converterUrl, 'converter')
        },
        async showQuery() {
          const { prepareViewPointer, createViewQuery } = await import('@view-builder/view-util')

          const { pointer } = store.getState().viewForm
          const view = await prepareViewPointer(pointer, { client })
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
          const { prepareViewPointer } = await import('@view-builder/view-util')

          const { pointer } = store.getState().viewForm
          const view = await prepareViewPointer(pointer, { client })
          const resourceTurtle = turtle`${view.dataset}`.toString()

          const cubeViewerUrl = `https://cubeviewerdemo.netlify.app/?endpointUrl=${encodeURIComponent(endpoint)}&view=${encodeURIComponent(resourceTurtle)}`

          window.open(cubeViewerUrl, 'cubeViewer')
        },
        'core/setContentResource': ({ pointer }) => {
          if (pointer.has(rdf.type, ns.view.View).term) {
            dispatch.viewForm.populateForm(pointer.term)
          } else {
            dispatch.viewForm.clearView()
          }
        },
        async populateForm(term) {
          // first, need to retrieve a minimal representation
          const apiClient = store.getState().core.client
          const { representation } = await apiClient.loadResource(term.value, {
            Prefer: 'return=minimal',
          })

          let { dataset } = representation.root.pointer

          // resource retrieved from API is in a named graph.
          // we clone the triples and put them in a new dataset in the default graph
          dataset = $rdf.dataset([...dataset])
            .match(null, null, null, term)
            .map(({ subject, predicate, object }) => $rdf.quad(subject, predicate, object))

          dispatch.viewForm.setView(clownface({ dataset }).node(term))
        },
        toggleButtons: toggleButtons(store),
        setView: multiEffect(
          toggleButtons(store),
          () => {
            const { pointer } = store.getState().viewForm
            const view = store.getState()
              .resource.representations
              .get(pointer.term)
              .root

            const saveOperation = view.findOperations({
              byMethod: 'PUT',
            }).shift()

            dispatch.viewForm.setSaveOperation(saveOperation)
          },
        ),
      }
    },
  },
}
