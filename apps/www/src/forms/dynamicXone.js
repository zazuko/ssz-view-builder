import { decorate } from '@hydrofoil/shaperone-wc/templates.js'
import { findNodes } from 'clownface-shacl-path'
import { isGraphPointer } from 'is-graph-pointer'
import { owl } from '@tpluscode/rdf-ns-builders'
import sh1 from '@hydrofoil/shaperone-core/ns.js'

/**
 * Focus node rendering decorator, which will choose properties to render by only showing those
 * matching a `sh1:xoneDiscriminator`.
 *
 * Add a hidden property to the items of `sh:xone`. Properties within its group will be shown only,
 * when the focus node value of the discriminator matches the `sh:hasValue` of that hidden property
 *
 * <shape>
 *    sh1:xoneDiscriminator <property> ;
 *    sh:xone (
 *      [
 *        sh1:discriminatorValue "foo" ;
 *        sh:property <foo1> , <foo2> , <foo3>;
 *      ]
 *      [
 *        sh1:discriminatorValue "bar" ;
 *        sh:property <bar1> , <bar2> , <bar3>;
 *      ]
 *    )
 * .
 */
export default decorate(wrapped => function dynamicXone(context, args) {
  const { focusNode, actions } = context
  const { focusNode: pointer, logicalConstraints: { xone }, shape } = focusNode

  const discriminator = shape?.pointer.out(sh1.xoneDiscriminator)
  if (isGraphPointer(discriminator)) {
    const [actualValue] = findNodes(pointer, discriminator).terms

    for (const group of xone) {
      for (const shapeInGroup of group.shapes) {
        const properties = shapeInGroup.property.filter(({ hidden }) => !hidden)
        requestAnimationFrame(() => {
          if (shouldDisplay(shapeInGroup, actualValue)) {
            properties.forEach(propShape => actions.showProperty(propShape))
          } else {
            properties.forEach((propShape) => {
              const propState = focusNode.properties.find(arg => arg.shape.equals(propShape))
              if (!propState.hidden) {
                actions.clearProperty(propShape)
                actions.hideProperty(propShape)
              }
            })
          }
        })
      }
    }
  }

  return wrapped(context, args)
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
