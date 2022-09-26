import sh1 from '@hydrofoil/shaperone-core/ns.js'

// todo: https://github.com/hypermedia-app/shaperone/issues/156
export const instancesMultiSelectEditor = {
  term: sh1.InstancesMultiSelectEditor,
  match(shape) {
    return shape.editor?.equals(sh1.InstancesMultiSelectEditor)
  },
}
