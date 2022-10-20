import { prepareViewPointer } from '@view-builder/view-util'

export default function (pointer) {
  return prepareViewPointer(pointer, {
    removeEventListener: true,
    rename: true,
    removeLimitOffset: true,
  })
}
