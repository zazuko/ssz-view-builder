import { expect } from 'chai'
import { ssz, testData } from '@view-builder/testing'
import { view, viewBuilder } from '@view-builder/core/ns.js'
import { rdf, schema, xsd } from '@tpluscode/rdf-ns-builders'
import { prepareViewPointer } from '../index.js'

describe('@view-builder/view-util', () => {
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
        const viewView = prepareViewPointer(builderView)

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

        viewView = prepareViewPointer(builderView)
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
  })
})
