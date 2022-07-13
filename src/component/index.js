import {
  instancesSelect
} from '@hydrofoil/shaperone-core/components'

export const instancesSelectEditor = {
  ...instancesSelect,
  async lazyRender() {
    return (await import('./instancesSelect.js')).default
  },
}