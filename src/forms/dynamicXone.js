import { decorate } from '@hydrofoil/shaperone-wc/templates.js'
import { findNodes } from 'clownface-shacl-path'
import { isGraphPointer } from 'is-graph-pointer'
import { owl } from '@tpluscode/rdf-ns-builders'
import { sh1 } from '../ns.js'

/**
 * Focus node rendering decorator, which will choose properties to render by only showing those
 * matching a `sh1:xoneDiscriminator`.
 *
 * Add a hidden property to the items of `sh:xone`. Properties within its group will be shown onyl when
 * the focus node value of the discriminator matches the `sh:hasValue` of that hidden property
 *
 * <shape>
 *    sh1:discriminator <property> ;
 *    sh:xone (
 *      [
 *        sh:property [
 *          sh:path <property> ;
 *          sh:hasValue "foo" ;
 *          dash:hidden true ;
 *        ] ;
 *        sh:property <foo1> , <foo2> , <foo3>;
 *      ]
 *      [
 *        sh:property [
 *          sh:path <property> ;
 *          sh:hasValue "bar" ;
 *          dash:hidden true ;
 *        ] ;
 *        sh:property <bar1> , <bar2> , <bar3>;
 *      ]
 *    )
 * .
 */
export default decorate((wrapped) => {
  return function dynamicXone(context, args) {
    const { focusNode: { focusNode, logicalConstraints: { xone }, shape }, actions } = context

    const discriminator = shape?.pointer.out(sh1.xoneDiscriminator)
    if (isGraphPointer(discriminator)) {
      const [actualValue] = findNodes(focusNode, discriminator).terms

      for (const group of xone) {
        for (const shape of group.shapes) {
          const properties = shape.property.filter(({ hidden }) => !hidden)
          requestAnimationFrame(() => {
            if (shouldDisplay(shape, actualValue)) {
              properties.forEach(shape => actions.showProperty(shape))
            } else {
              properties.forEach(shape => actions.hideProperty(shape))
            }
          })
        }
      }
    }

    return wrapped(context, args)
  }
})

const { differentFrom } = owl
function shouldDisplay(shape, value) {
  const discriminatorValue = shape.pointer.out(sh1.discriminatorValue)

  if (!value) {
    return false
  }
  if (value.equals(discriminatorValue.term)) {
    return true
  }

  const excludedValues = discriminatorValue.out(differentFrom).terms
  if (excludedValues.length) {
    return !excludedValues.some(term => term.equals(value))
  }

  return false
}
