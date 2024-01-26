import { createModel } from '@captaincodeman/rdx'
import ParsingClient from 'sparql-http-client/ParsingClient.js'
import $rdf from '@view-builder/core/env.js'
import * as loadingView from '../../view/loading.js'
import effects from './effects.js'

export const app = createModel({
  state: {
    view: { ...loadingView },
    softwareComponents: [],
  },
  reducers: {
    showView(state, view) {
      if (view.content === state.view.content) {
        return state
      }

      return { ...state, view: { ...view } }
    },
    viewParam(state, param) {
      return { ...state, view: { ...state.view, param } }
    },
    setSparqlEndpoint(state, endpointUrl) {
      return {
        ...state,
        sparqlClient: new ParsingClient({
          endpointUrl,
        }),
      }
    },
    setSoftwareComponents(state, api) {
      if (state.softwareComponents.length) {
        return state
      }

      const softwareComponents = api.pointer
        .out($rdf.ns.schema.application)
        .toArray()
        .map(arg => [
          arg.out($rdf.ns.schema.name).value,
          arg.out($rdf.ns.schema.softwareVersion).value,
        ])

      return {
        ...state,
        softwareComponents,
      }
    },
  },
  effects,
})
