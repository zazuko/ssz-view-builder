import sinon from 'sinon'
import { expect } from 'chai'
import $rdf from '@view-builder/core/env.js'
import { owl, sh } from '@tpluscode/rdf-ns-builders'
import sh1 from '@hydrofoil/shaperone-core/ns.js'
import { ex, testData } from '@view-builder/testing'
import dynamicXone from '../../src/forms/dynamicXone.js'

global.requestAnimationFrame = cb => cb()

const template = dynamicXone(sinon.spy())

describe('forms/dynamicXone.js', () => {
  let focusNode
  let shape
  let actions
  let xone

  beforeEach(async () => {
    focusNode = $rdf.clownface({ dataset: $rdf.dataset() }).blankNode()
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
      shapes: shape.any().has(sh1.discriminatorValue).map($rdf.rdfine.sh.PropertyShape),
    }]
    actions = {
      showProperty: sinon.spy(),
      hideProperty: sinon.spy(),
      clearProperty: sinon.spy(),
    }
  })

  describe('when value matches discriminator', () => {
    it('hides all properties when no value is selected', () => {
      // given
      const context = {
        focusNode: {
          focusNode,
          logicalConstraints: { xone },
          shape: $rdf.rdfine.sh.NodeShape(shape),
          properties: [{
            shape: $rdf.rdfine.sh.PropertyShape(shape.namedNode('PropertyFoo')),
          }, {
            shape: $rdf.rdfine.sh.PropertyShape(shape.namedNode('PropertyBar')),
          }, {
            shape: $rdf.rdfine.sh.PropertyShape(shape.namedNode('PropertyBaz')),
          }],
        },
        actions,
      }

      // when
      template(context)

      // then
      expect(actions.showProperty).not.to.have.been.called
      expect(actions.hideProperty).to.have.callCount(3)
      expect(actions.clearProperty).to.have.callCount(3)
    })

    it('displays properties from shape matching actual value and hides others', () => {
      // given
      focusNode.addOut(ex.predicate, 'FOO')
      const context = {
        focusNode: {
          focusNode,
          logicalConstraints: { xone },
          shape: $rdf.rdfine.sh.NodeShape(shape),
          properties: [{
            shape: $rdf.rdfine.sh.PropertyShape(shape.namedNode('PropertyFoo')),
          }, {
            shape: $rdf.rdfine.sh.PropertyShape(shape.namedNode('PropertyBar')),
          }, {
            shape: $rdf.rdfine.sh.PropertyShape(shape.namedNode('PropertyBaz')),
          }],
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
      expect(actions.clearProperty).to.have.callCount(2)
    })

    it('displays properties from shape with negative condition', () => {
      // given
      focusNode.addOut(ex.predicate, 'BAZ')
      const context = {
        focusNode: {
          focusNode,
          logicalConstraints: { xone },
          shape: $rdf.rdfine.sh.NodeShape(shape),
          properties: [{
            shape: $rdf.rdfine.sh.PropertyShape(shape.namedNode('PropertyFoo')),
          }, {
            shape: $rdf.rdfine.sh.PropertyShape(shape.namedNode('PropertyBar')),
          }, {
            shape: $rdf.rdfine.sh.PropertyShape(shape.namedNode('PropertyBaz')),
          }],
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
      expect(actions.clearProperty).to.have.callCount(2)
    })

    it('does nothing when properties are already hidden', () => {
      // given
      focusNode.addOut(ex.predicate, 'BAZ')
      const context = {
        focusNode: {
          focusNode,
          logicalConstraints: { xone },
          shape: $rdf.rdfine.sh.NodeShape(shape),
          properties: [{
            shape: $rdf.rdfine.sh.PropertyShape(shape.namedNode('PropertyFoo')),
            hidden: true,
          }, {
            shape: $rdf.rdfine.sh.PropertyShape(shape.namedNode('PropertyBar')),
            hidden: true,
          }, {
            shape: $rdf.rdfine.sh.PropertyShape(shape.namedNode('PropertyBaz')),
            hidden: true,
          }],
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
      expect(actions.hideProperty).not.to.have.been.called
      expect(actions.clearProperty).not.to.have.been.called
    })
  })
})
