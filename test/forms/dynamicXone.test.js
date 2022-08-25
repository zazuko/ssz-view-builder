import sinon from 'sinon'
import { expect } from 'chai'
import clownface from 'clownface'
import $rdf from 'rdf-ext'
import { fromPointer } from '@rdfine/shacl/lib/NodeShape'
import { fromPointer as propertyShape } from '@rdfine/shacl/lib/PropertyShape'
import { owl, sh } from '@tpluscode/rdf-ns-builders'
import dynamicXone from '../../src/forms/dynamicXone.js'
import { ex, testData } from '../_helpers.js'
import { sh1 } from '../../src/ns.js'

global.requestAnimationFrame = cb => cb()

const template = dynamicXone(sinon.spy())

describe('forms/dynamicXone.js', () => {
  let focusNode
  let shape
  let actions
  let xone

  beforeEach(async () => {
    focusNode = clownface({ dataset: $rdf.dataset() }).blankNode()
    shape = await testData`
      <>
        ${sh1.xoneDiscriminator} ${ex.predicate} ;
      .
      
      <ShapeFoo>
        ${sh1.discriminatorValue} "FOO" ;
        ${sh.property} <PropertyFoo> .
      
      <ShapeBar>
        ${sh1.discriminatorValue} "BAR" ;
        ${sh.property} <PropertyBar> .
      
      <ShapeBaz>
        ${sh1.discriminatorValue} [
          ${owl.differentFrom} "FOO", "BAR" ;
        ] ;
        ${sh.property} <PropertyBaz> .
    `
    xone = [{
      shapes: shape.any().has(sh1.discriminatorValue).map(propertyShape),
    }]
    actions = {
      showProperty: sinon.spy(),
      hideProperty: sinon.spy(),
    }
  })

  describe('when value matches discriminator', () => {
    it('hides all properties when no value is selected', () => {
      // given
      const context = {
        focusNode: {
          focusNode,
          logicalConstraints: { xone },
          shape: fromPointer(shape),
        },
        actions,
      }

      // when
      template(context)

      // then
      expect(actions.showProperty).not.to.have.been.called
      expect(actions.hideProperty).to.have.callCount(3)
    })

    it('displays properties from shape matching actual value and hides others', () => {
      // given
      focusNode.addOut(ex.predicate, 'FOO')
      const context = {
        focusNode: {
          focusNode,
          logicalConstraints: { xone },
          shape: fromPointer(shape),
        },
        actions,
      }

      // when
      template(context)

      // then
      expect(actions.showProperty).to.have.been.calledOnceWith(
        sinon.match({
          id: $rdf.namedNode('PropertyFoo'),
        }),
      )
      expect(actions.hideProperty).to.have.callCount(2)
    })

    it('displays properties from shape with negative condition', () => {
      // given
      focusNode.addOut(ex.predicate, 'BAZ')
      const context = {
        focusNode: {
          focusNode,
          logicalConstraints: { xone },
          shape: fromPointer(shape),
        },
        actions,
      }

      // when
      template(context)

      // then
      expect(actions.showProperty).to.have.been.calledOnceWith(
        sinon.match({
          id: $rdf.namedNode('PropertyBaz'),
        }),
      )
      expect(actions.hideProperty).to.have.callCount(2)
    })
  })
})
