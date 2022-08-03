import {
  instancesSelect,
  enumSelect,
} from '@hydrofoil/shaperone-core/components'
import { dash, schema } from '@tpluscode/rdf-ns-builders'
import { getLocalizedLabel } from '@rdfjs-elements/lit-helpers'

export const autocompleteEditor = {
  ...instancesSelect,
  editor: dash.AutoCompleteEditor,
  async lazyRender() {
    return (await import('./autocomplete.js')).autocomplete
  },
  initLabel({ value, updateComponentState }) {
    const {
      object,
      componentState: { freetextQuery, selectionLoading },
    } = value

    if(object && !freetextQuery && !selectionLoading) {
      const selectionLoading = this.loadInstance({ value: object })
        .then(resource => {
            updateComponentState({
              freetextQuery: getLocalizedLabel(resource.out(schema.name))
            })
        })

        updateComponentState({ selectionLoading })
    }
  },
  init(...args) {
    instancesSelect.init.call(this, ...args)

    this.initLabel(args[0])

    return true
  },
}

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
