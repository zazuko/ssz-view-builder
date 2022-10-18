import { nanoid } from 'nanoid'

export const notifications = {
  model: {
    state: {
      list: new Map(),
    },
    reducers: {
      show(state, notification) {
        state.list.set(nanoid(), notification)
        return state
      },
      hide(state, id) {
        state.list.delete(id)
        return state
      },
    },
  },
}
