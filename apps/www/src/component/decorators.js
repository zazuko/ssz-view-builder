import $rdf from '@view-builder/core/env.js'

export const dataGraphInstanceSource = {
  applicableTo(component) {
    return component.editor.equals($rdf.ns.dash.InstancesSelectEditor)
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
          .has($rdf.ns.rdf.type, clas.id)
          .toArray()
      },
    }
  },
}
