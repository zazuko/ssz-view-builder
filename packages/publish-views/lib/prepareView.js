import { prepareViewPointer } from '@view-builder/view-util'
import { _void, dcat, rdf, schema } from '@tpluscode/rdf-ns-builders'

export default function (pointer) {
  const view = prepareViewPointer(pointer, {
    removeEventListener: true,
    rename: true,
    removeLimitOffset: true,
  })

  view
    .addOut(rdf.type, [dcat.Dataset, _void.Dataset])
    .deleteOut(schema.author)

  return view
}
