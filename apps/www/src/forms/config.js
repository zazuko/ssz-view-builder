// configuration goes here

import * as configure from '@hydrofoil/shaperone-wc/configure'
import * as templates from '@hydrofoil/shaperone-wc-shoelace/templates.js'
import * as shoelace from '@hydrofoil/shaperone-wc-shoelace/components.js'
import { instancesMultiSelectEditor } from '@hydrofoil/shaperone-wc-shoelace/component-extras.js'
import shaperoneHydra from '@hydrofoil/shaperone-hydra'
import $rdf from '@view-builder/core/env.js'
import * as decorators from '../component/decorators.js'
import * as editors from '../editor/index.js'
import dynamicXone from './dynamicXone.js'
import debugProperties from './debugProperties.js'

shaperoneHydra(configure)

shoelace.autocomplete.labelProperties = [$rdf.ns.schema.name, $rdf.ns.rdfs.label]

configure.editors.addMatchers(editors)

configure.renderer.setTemplates(templates)
configure.renderer.setTemplates({
  focusNode: dynamicXone(templates.focusNode),
  property: debugProperties(templates.property),
})
configure.components.pushComponents({
  ...shoelace,
  instancesMultiSelectEditor,
})

Object.values(decorators)
  .forEach(configure.components.decorate)
