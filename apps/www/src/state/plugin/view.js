import { turtle } from '@tpluscode/rdf-string'
import $rdf from '@view-builder/core/env.js'
import * as ns from '@view-builder/core/ns.js'
import { nanoid } from 'nanoid'
import { getAllTriplesFromRoot } from '../../clownface.js'
import toggleButtons from './viewForm/toggleButtons.js'
import { multiEffect } from '../lib/multiEffect.js'

export const viewForm = {
  model: {
    state: {
      validity: {
        report: {},
      },
      sourcesValidity: {
        report: {},
      },
    },
    reducers: {
      setView(state, pointer) {
        return { ...state, pointer }
      },
      clearView(state) {
        if (!('pointer' in state)) return state

        const { pointer, ...rest } = state // eslint-disable-line @typescript-eslint/no-unused-vars
        return rest
      },
      setSaveOperation(state, saveOperation) {
        return { ...state, saveOperation }
      },
      setSourcesValidity(state, { report, shapes, pointer }) {
        return { ...state, sourcesValidity: { report, shapes, pointer } }
      },
      setViewValidity(state, { report, shapes, pointer }) {
        return { ...state, validity: { report, shapes, pointer } }
      },
    },
    effects(store) {
      const dispatch = store.getDispatch()

      function whenValidCall(stateProperty, effect) {
        return () => {
          const { report } = store.getState().viewForm[stateProperty]
          if (report?.conforms === false) {
            dispatch.notifications.errorDialog(report.pointer)
            return
          }

          effect()
        }
      }

      return {
        async saveView() {
          const { pointer, saveOperation } = store.getState().viewForm

          const dataset = $rdf.dataset([...getAllTriplesFromRoot(pointer)])
          const payload = $rdf.clownface({ dataset }).node(pointer)
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
        generateDimensions: whenValidCall('sourcesValidity', async () => {
          const { generateDimensions } = await import('../../automation.js')

          const { pointer } = store.getState().viewForm
          const client = store.getState().app.sparqlClient

          const task = nanoid()
          dispatch.notifications.addTask(task)
          const updatedView = await generateDimensions(pointer, { client })
          dispatch.viewForm.setView(updatedView)

          const count = updatedView.any().has(ns.viewBuilder.generated, true).terms.length
          dispatch.notifications.deleteTask(task)
          dispatch.notifications.show({
            variant: 'success',
            content: `${count} dimension(s) generated`,
          })
        }),
        async showView() {
          const { prepareViewPointer } = await import('@view-builder/view-util')

          const { pointer } = store.getState().viewForm
          const client = store.getState().app.sparqlClient
          const view = await prepareViewPointer(pointer, { client })

          const resourceTurtle = turtle`${view.dataset}`.toString()
          const converterUrl = `https://converter.zazuko.com/#value=${encodeURIComponent(resourceTurtle)}&format=text%2Fturtle`
          window.open(converterUrl, 'converter')
        },
        showQuery: whenValidCall('validity', async () => {
          const client = store.getState().app.sparqlClient
          const endpoint = client.query.endpoint.endpointUrl
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
        }),
        showInCubeViewer: whenValidCall('validity', async () => {
          const client = store.getState().app.sparqlClient
          const endpoint = client.query.endpoint.endpointUrl
          const { prepareViewPointer } = await import('@view-builder/view-util')

          const { pointer } = store.getState().viewForm
          const view = await prepareViewPointer(pointer, { client })
          const resourceTurtle = turtle`${view.dataset}`.toString()

          const cubeViewerUrl = `https://cube-viewer.zazuko.com/#endpointUrl=${encodeURIComponent(endpoint)}&view=${encodeURIComponent(resourceTurtle)}`

          window.open(cubeViewerUrl, 'cubeViewer')
        }),
        'core/setContentResource': ({ pointer }) => {
          if (pointer.has($rdf.ns.rdf.type, ns.view.View).term) {
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

          dispatch.viewForm.setView($rdf.clownface({ dataset }).node(term))
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
        async validateSources({ pointer, shapes }) {
          const Validator = (await import('rdf-validate-shacl')).default

          const report = new Validator(shapes).validate(pointer.dataset)

          dispatch.viewForm.setSourcesValidity({ report, pointer, shapes })
        },
        async validateView({ pointer, shapes }) {
          const Validator = (await import('rdf-validate-shacl')).default

          const report = new Validator(shapes).validate(pointer.dataset)

          dispatch.viewForm.setViewValidity({ report, pointer, shapes })
        },
      }
    },
  },
}
