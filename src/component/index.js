import {
  instancesSelect,
  enumSelect,
} from '@hydrofoil/shaperone-core/components'

export const instancesSelectEditor = {
  ...instancesSelect,
  async lazyRender() {
    return (await import('./instancesSelect.js')).instancesSelect
  },
}

export const enumSelectEditor = {
  ...enumSelect,
  async lazyRender() {
    return (await import('./instancesSelect.js')).enumSelect
  },
}
