import { expect } from 'chai'
import { ssz, testData } from '@view-builder/testing'
import { view, viewBuilder } from '@view-builder/core/ns.js'
import { rdf, schema, xsd } from '@tpluscode/rdf-ns-builders'
import sinon from 'sinon'
import { prepareViewPointer, createViewQuery } from '../index.js'
import { CubeLookup } from '../lib/cubeLookup.js'

describe('@view-builder/view-util', () => {
  let cubeLookup

  beforeEach(() => {
    cubeLookup = sinon.createStubInstance(CubeLookup)
    cubeLookup.isIriDimension.resolves(false)
  })

  describe('prepareViewPointer', () => {
    context('filter with simple operator', () => {
      it('creates dimension for filter with deep path', async () => {
        // given
        const builderView = await testData`
        <>
          ${view.dimension} <#ZEIT> ;
          ${view.filter} [
            ${view.operation} ${view.Lt} ;
            ${view.argument} "1950-01-01"^^${xsd.date} ;
            ${viewBuilder.baseDimension} <#ZEIT> ;
            ${viewBuilder.drillDownProperty} <https://ld.stadt-zuerich.ch/schema/hasEnd> ;
          ] ;
        .
        
        <#ZEIT>
          ${view.from} [
            ${view.source} [ ${view.cube} ${ssz('000003')} ] ;
            ${view.path} ${ssz('property/ZEIT')} ;
          ] ;
          ${view.as} ${ssz('property/ZEIT')} ;
        . 
      `

        // when
        const viewView = await prepareViewPointer(builderView, { cubeLookup })

        // then
        const filterDimension = viewView.out(view.filter).out(view.dimension)
        expect(viewView.has(view.dimension, filterDimension).term).to.be.ok

        const path = filterDimension.out(view.from).out(view.path).list()
        const pathValues = [...path].map(({ value }) => value)
        expect(pathValues).to.deep.contain.all.members([
          ssz('property/ZEIT').value,
          'https://ld.stadt-zuerich.ch/schema/hasEnd',
        ])
      })
    })

    context('filter with term set lookup', () => {
      let viewView

      beforeEach(async () => {
        // given
        const builderView = await testData`
        <>
          ${view.dimension} <#RAUM> ;
          ${view.filter} [
            ${viewBuilder.baseDimension} <#RAUM> ;
            ${viewBuilder.filterTermSet} ${ssz('termset/QuartiereZH')} ;
            
            # To be removed
            ${view.operation} ${view.Lt} ;
            ${view.argument} "to be removed" ;
          ] ;
        .
        
        <#RAUM>
          ${view.from} [
            ${view.source} [ ${view.cube} ${ssz('000003')} ] ;
            ${view.path} ${ssz('property/RAUM')} ;
          ] ;
          ${view.as} ${ssz('property/RAUM')} ;
        . 
      `

        viewView = await prepareViewPointer(builderView, { cubeLookup })
      })

      it('sets operation to view:Eq', () => {
        expect(viewView.out(view.filter).out(view.operation).term).to.deep.eq(view.Eq)
      })

      it('sets filter set as argument', () => {
        expect(viewView.out(view.filter).out(view.argument).value).to.eq(ssz('termset/QuartiereZH').value)
      })

      it('injects lookup source for dimension filtered by a filter set', () => {
        const dimension = viewView
          .out(view.dimension)
          .out(view.from)
          .has(view.path, schema.inDefinedTermSet)
        expect(dimension.out(view.source).out(rdf.type).term).to.deep.eq(view.LookupSource)

        const joined = dimension
          .out(view.join)
          .out(view.as)
        expect(joined.value).to.deep.eq(ssz('property/RAUM').value)
      })
    })

    context('IRI dimension', () => {
      context('with single source', () => {
        it('generates a join for schema:name when dimension is sh:IRI', async function () {
          // given
          cubeLookup.isIriDimension.resolves(true)

          const builderView = await testData`
            <>
              ${view.dimension} <#RAUM> ;
              ${view.projection} [] ;
            .
            
            <#RAUM>
              ${view.from} [
                ${view.source} [ a ${view.CubeSource} ; ${view.cube} ${ssz('000003')} ] ;
                ${view.path} ${ssz('property/RAUM')} ;
              ] ;
            . 
          `

          // when
          const viewView = await prepareViewPointer(builderView, { cubeLookup })
          const query = createViewQuery(viewView)

          // then
          expect(query).to.matchSnapshot(this)
        })

        it('does not generate a join for when dimension is not sh:IRI', async function () {
          // given
          cubeLookup.isIriDimension.resolves(false)

          const builderView = await testData`
            <>
              ${view.dimension} <#RAUM> ;
              ${view.projection} [] ;
            .
            
            <#RAUM>
              ${view.from} [
                ${view.source} [ a ${view.CubeSource} ; ${view.cube} ${ssz('000003')} ] ;
                ${view.path} ${ssz('property/RAUM')} ;
              ] ;
            . 
          `

          // when
          const viewView = await prepareViewPointer(builderView, { cubeLookup })
          const query = createViewQuery(viewView)

          // then
          expect(query).to.matchSnapshot(this)
        })
      })

      context('with multiple sources', () => {
        it('generates a join for schema:name when dimension is sh:IRI', async function () {
          // given
          cubeLookup.isIriDimension.resolves(true)

          const builderView = await testData`
            <>
              ${view.dimension} <#RAUM> ;
              ${view.projection} [] ;
            .
            
            <#RAUM>
              ${view.from} [
                ${view.source} 
                  [ a ${view.CubeSource} ; ${view.cube} ${ssz('000003')} ] ,
                  [ a ${view.CubeSource} ; ${view.cube} ${ssz('000015')} ] ;
                ${view.path} ${ssz('property/RAUM')} ;
              ] ;
            . 
          `

          // when
          const viewView = await prepareViewPointer(builderView, { cubeLookup })
          const query = createViewQuery(viewView)

          // then
          expect(query).to.matchSnapshot(this)
        })
      })
    })
  })
})
