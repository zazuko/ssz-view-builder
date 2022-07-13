import * as configure from '@hydrofoil/shaperone-wc/configure'
import * as templates from '@hydrofoil/shaperone-wc-shoelace/templates.js'
import * as shoelace from '@hydrofoil/shaperone-wc-shoelace/components.js'
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js'
import * as local from './component/index.js'
import { instancesSelector } from '@hydrofoil/shaperone-hydra/components'
import * as decorators from './component/decorators.js'

configure.editors.decorate(instancesSelector.matcher)
configure.components.decorate(instancesSelector.decorator())

setBasePath('https://unpkg.com/@shoelace-style/shoelace/dist') 

configure.renderer.setTemplates(templates)
configure.components.pushComponents(shoelace)

Object.values(decorators)
  .forEach(configure.components.decorate)

// configure.components.pushComponents(local)
