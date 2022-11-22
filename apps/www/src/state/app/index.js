import { createModel } from '@captaincodeman/rdx'
import ParsingClient from 'sparql-http-client/ParsingClient.js'
import * as loadingView from '../../view/loading.js'
import effects from './effects.js'

export const app = createModel({
  state: {
    view: { ...loadingView },
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
  },
  effects,
})
