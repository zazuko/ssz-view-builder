import { dash, rdf } from '@tpluscode/rdf-ns-builders'

export const dataGraphInstanceSource = {
  applicableTo(component) {
    return component.editor.equals(dash.InstancesSelectEditor)
  },
  decorate(component) {
    return {
      ...component,
      loadChoices(args, freetextQuery) {
        const { focusNode, property } = args
        const { class: clas } = property.shape
        if (!clas) {
          return component.loadChoices(args, freetextQuery)
        }

        return focusNode
          .any()
          .has(rdf.type, clas.id)
          .toArray()
      },
    }
  },
}
