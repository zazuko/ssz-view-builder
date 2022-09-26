import { createModel } from '@captaincodeman/rdx'
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
  },
  effects,
})
