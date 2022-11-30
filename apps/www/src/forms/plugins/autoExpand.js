import { viewBuilder } from '@view-builder/core/ns.js'

export const autoExpand = {
  model: {
    effects(store) {
      const dispatch = store.getDispatch()

      return {
        /**
         * When a property is initialized with `view-builder:source` property,
         * set it to open
         */
        'forms/initObjectValue': (arg) => {
          const { path } = arg.property

          if ('id' in path && path.id.equals(viewBuilder.source)) {
            dispatch.forms.updateComponentState({ ...arg, newState: { open: true } })
          }
        },
      }
    },
  },
}
