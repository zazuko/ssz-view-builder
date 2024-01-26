import { expect } from 'chai'
import sinon from 'sinon'
import $rdf from '@zazuko/env'
import { viewBuilder, view } from '@view-builder/core/ns.js'
import { ex, testData } from '@view-builder/testing'
import { generateDimensions } from '../src/automation.js'

describe('automation.js', () => {
  let queries

  beforeEach(() => {
    queries = {
      findKeyDimensions: sinon.stub().resolves([]),
      findMeasureDimensions: sinon.stub().resolves([]),
    }
  })

  describe('generateDimensions', () => {
    it('generates a view dimension for cube measure', async () => {
      // given
      queries.findMeasureDimensions.resolves([
        { dimension: ex.Kennzahl, label: $rdf.literal('KENNZAHL') },
      ])

      const before = await testData`
        <> a ${view.View} ;
           ${viewBuilder.source} [
             ${view.cube} ${ex.cube} ;
           ] ;
           . 
      `

      // when
      const after = await generateDimensions(before, { queries })

      // then
      const dimensions = after.out(view.dimension)
      expect(dimensions.terms).to.have.length(1)
      expect(dimensions.out(view.from).out(view.path).term).to.deep.eq(ex.Kennzahl)
      expect(dimensions.out(view.from).out(view.source).term)
        .to.deep.eq(before.out(viewBuilder.source).term)
      expect(dimensions.out($rdf.ns.rdfs.label).value).to.contain('KENNZAHL')
    })

    it('generates a view dimension for key dimensions', async () => {
      // given
      queries.findKeyDimensions.resolves([
        { cube: ex.Cube, dimension: ex.Width, label: $rdf.literal('Width') },
        { cube: ex.Cube, dimension: ex.Height, label: $rdf.literal('Height') },
      ])

      const before = await testData`
        <> a ${view.View} ;
           ${viewBuilder.source} [
             ${view.cube} ${ex.Cube} ;
           ] ;
           . 
      `

      // when
      const after = await generateDimensions(before, { queries })

      // then
      const dimensions = after.out(view.dimension)
      expect(dimensions.terms).to.have.length(2)
      expect(dimensions.out(view.from).out(view.path).terms).to.deep.eq([ex.Width, ex.Height])
      expect(dimensions.out(view.from).out(view.source).terms).to.have.all.members([
        before.out(viewBuilder.source).term,
        before.out(viewBuilder.source).term,
      ])
    })

    it('generates joined dimension for same property', async () => {
      // given
      queries.findKeyDimensions.resolves([
        { cube: ex.Cube1, dimension: ex.Width, label: $rdf.literal('Width') },
        { cube: ex.Cube2, dimension: ex.Width, label: $rdf.literal('Width') },
      ])

      const before = await testData`
        <> a ${view.View} ;
           ${viewBuilder.source} [
             ${view.cube} ${ex.Cube1} ;
           ] , [
             ${view.cube} ${ex.Cube2} ;
           ] ;
           . 
      `

      // when
      const after = await generateDimensions(before, { queries })

      // then
      const dimensions = after.out(view.dimension)
      expect(dimensions.terms).to.have.length(1)
      expect(dimensions.out(view.from).out(view.path).term).to.deep.eq(ex.Width)
      expect(dimensions.out(view.from).out(view.source).terms)
        .to.have.all.members(before.out(viewBuilder.source).terms)
    })

    it('removes all existing generated dimensions', async () => {
      // given
      queries.findMeasureDimensions.resolves([
        { dimension: ex.Kennzahl, label: $rdf.literal('KENNZAHL') },
      ])

      const before = await testData`
        <> a ${view.View} ;
           ${viewBuilder.source} <source> ;
           ${view.dimension} [
             a ${view.Dimension} ;
             ${viewBuilder.generated} true ;
             ${view.source} <source> ;
           ] ;
        .
        
        <dangling1> a ${view.Dimension} ; ${viewBuilder.generated} true ; ${view.source} <source> .
        <dangling2> a ${view.Dimension} ; ${viewBuilder.generated} true ; ${view.source} <source> .
        
        <source> ${view.cube} ${ex.cube} .
      `

      // when
      const after = await generateDimensions(before, { queries })

      // then
      const dimensions = after.any().has($rdf.ns.rdf.type, view.Dimension)
      expect(dimensions.terms).to.have.length(1)
      expect(dimensions.out(view.from).out(view.path).term).to.deep.eq(ex.Kennzahl)
      expect(dimensions.out(view.from).out(view.source).term)
        .to.deep.eq(before.out(viewBuilder.source).term)
      expect(dimensions.out($rdf.ns.rdfs.label).value).to.contain('KENNZAHL')
    })
  })
})
