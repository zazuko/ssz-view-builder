import { prepareViewPointer } from '@view-builder/view-util'
import { schema } from '@tpluscode/rdf-ns-builders'

export default function (pointer) {
  const view = prepareViewPointer(pointer, {
    removeEventListener: true,
    rename: true,
    removeLimitOffset: true,
  })

  view
    .deleteOut(schema.author)

  return view
}
