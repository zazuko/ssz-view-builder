import { prepareViewPointer } from '@view-builder/view-util'
import { dcat, rdf } from '@tpluscode/rdf-ns-builders'

export default function (pointer) {
  const view = prepareViewPointer(pointer, {
    removeEventListener: true,
    rename: true,
    removeLimitOffset: true,
  })

  view.addOut(rdf.type, dcat.Dataset)

  return view
}
