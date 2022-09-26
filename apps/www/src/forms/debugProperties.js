import { decorate } from '@hydrofoil/shaperone-wc/templates.js'
import sh1 from '@hydrofoil/shaperone-core/ns.js'
import { html } from 'lit'

export default decorate(wrapped => (context, args) => {
  const showInDebugMode = () => context.property.shape.pointer.has(sh1.showInDebugOnly, true).term
  if (!window.Shaperone.DEBUG && showInDebugMode()) {
    return html`<div style="display: none">${wrapped(context, args)}</div>`
  }

  return wrapped(context, args)
})
