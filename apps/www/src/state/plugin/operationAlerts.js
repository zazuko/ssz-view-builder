export const operationAlerts = {
  model: {
    state: {},
    reducers: {},
    effects(store) {
      const { notifications } = store.getDispatch()

      return {
        'operation/failed': ({ response }) => {
          if (!response?.xhr.ok) {
            notifications.show({
              content: 'The request failed',
              variant: 'danger',
              autoHide: false,
            })
          }
        },
      }
    },
  },
}
