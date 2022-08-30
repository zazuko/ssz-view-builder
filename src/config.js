// configuration goes here

import * as configure from '@hydrofoil/shaperone-wc/configure'
import * as templates from '@hydrofoil/shaperone-wc-shoelace/templates.js'
import * as shoelace from '@hydrofoil/shaperone-wc-shoelace/components.js'
import { instancesMultiSelectEditor } from '@hydrofoil/shaperone-wc-shoelace/component-extras.js'
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js'
import shaperoneHydra from '@hydrofoil/shaperone-hydra'
import * as decorators from './component/decorators.js'
import * as editors from './editor/index.js'
import dynamicXone from './forms/dynamicXone.js'
import filterDimensionViewer from './component/filterDimensionViewer.js'

shaperoneHydra(configure)

setBasePath('https://unpkg.com/@shoelace-style/shoelace/dist')

configure.editors.addMatchers(editors)

configure.renderer.setTemplates(templates)
configure.renderer.setTemplates({
  focusNode: dynamicXone(templates.focusNode),
})
configure.components.pushComponents({
  ...shoelace,
  instancesMultiSelectEditor,
  filterDimensionViewer,
})

Object.values(decorators)
  .forEach(configure.components.decorate)
