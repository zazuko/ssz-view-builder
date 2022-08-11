import {
  instancesSelect,
  enumSelect,
} from '@hydrofoil/shaperone-core/components'
import { dash } from '@tpluscode/rdf-ns-builders'

export const autocompleteEditor = {
  ...instancesSelect,
  editor: dash.AutoCompleteEditor,
  async lazyRender() {
    return (await import('./autocomplete.js')).autocomplete
  },
  init(...args) {
    instancesSelect.init.call(this, ...args)

    return true
  },
}

export const instancesSelectEditor = {
  ...instancesSelect,
  async lazyRender() {
    return (await import('./instancesSelect.js')).instancesSelect
  },
}

export const instancesMultiSelectEditor = {
  ...instancesSelect,
  editor: dash.InstancesMultiSelectEditor,
  async lazyRender() {
    return (await import('./instancesSelect.js')).multiSelect
  },
}

export const enumSelectEditor = {
  ...enumSelect,
  async lazyRender() {
    return (await import('./instancesSelect.js')).enumSelect
  },
}
