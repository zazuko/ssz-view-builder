import { dash } from '@tpluscode/rdf-ns-builders'

// todo: https://github.com/hypermedia-app/shaperone/issues/156
export const instancesMultiSelectEditor = {
  term: dash.InstancesMultiSelectEditor,
  match(shape) {
    return shape.editor?.equals(dash.InstancesMultiSelectEditor)
  },
}
