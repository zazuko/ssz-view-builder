// configuration goes here

import $rdf from 'rdf-ext'
import { dash, rdf } from '@tpluscode/rdf-ns-builders'
import * as configure from '@hydrofoil/shaperone-wc/configure'
import * as templates from '@hydrofoil/shaperone-wc-shoelace/templates.js'
import * as shoelace from '@hydrofoil/shaperone-wc-shoelace/components.js'
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js'
import * as local from './component/index.js'
import shaperoneHydra from '@hydrofoil/shaperone-hydra'
import * as decorators from './component/decorators.js'
import * as editors from './editor/index.js'

shaperoneHydra(configure)

setBasePath('https://unpkg.com/@shoelace-style/shoelace/dist')

configure.editors.addMetadata([
  $rdf.quad(dash.InstancesMultiSelectEditor, rdf.type, dash.MultiEditor)
])
configure.editors.addMatchers(editors)

configure.renderer.setTemplates(templates)
configure.components.pushComponents(shoelace)

Object.values(decorators)
  .forEach(configure.components.decorate)

configure.components.pushComponents(local)
