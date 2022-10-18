import { nanoid } from 'nanoid'

export const notifications = {
  model: {
    state: {
      list: new Map(),
      backgroundTasks: new Set(),
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
      addTask(state, taskId) {
        state.backgroundTasks.add(taskId)
        return state
      },
      deleteTask(state, taskId) {
        state.backgroundTasks.delete(taskId)
        return state
      },
    },
    effects(store) {
      const dispatch = store.getDispatch().notifications

      return {
        'operation/invoke': ({ operation }) => {
          dispatch.addTask(operation.id.value)
        },
        'operation/completed': ({ operation }) => {
          dispatch.deleteTask(operation.id.value)
        },
      }
    },
  },
}
