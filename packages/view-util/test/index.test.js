import { expect } from 'chai'
import { ssz, testData } from '@view-builder/testing'
import { view, viewBuilder } from '@view-builder/core/ns.js'
import { hydra, rdf, schema, xsd } from '@tpluscode/rdf-ns-builders'
import { isBlankNode } from 'is-graph-pointer'
import sinon from 'sinon'
import { prepareViewPointer, createViewQuery } from '../index.js'
import { MetaLookup } from '../lib/metaLookup.js'

describe('@view-builder/view-util', () => {
  let metaLookup

  beforeEach(() => {
    metaLookup = sinon.createStubInstance(MetaLookup)
    metaLookup.isIriDimension.resolves(false)
    metaLookup.getDimensionIdentifiers.resolves(new Map())
    metaLookup.getCubeKeys.resolves([])
    metaLookup.getDataAttributes.resolves([])
  })

  it('turns cube source to blank nodes', async () => {
    // given
    const builderView = await testData`
      <>
        ${view.dimension} [
          ${view.from} [
            ${view.source} <#source> ;
            ${view.path} ${ssz('property/ZEIT')} ;
          ] ;
          ${view.as} ${ssz('property/ZEIT')} ;
        ] ;
      .
      
      <#source> ${view.cube} ${ssz('000003')} .
    `

    // when
    const viewView = await prepareViewPointer(builderView, { metaLookup })

    // then
    const source = viewView.out(view.dimension).out(view.from).out(view.source)
    expect(isBlankNode(source)).to.be.true
  })

  it('removes view builder and hydra properties', async () => {
    // given
    const builderView = await testData`
      <>
        ${hydra.apiDocumentation} </api> ;
        ${viewBuilder.source} <#source> ;
      .      
    `

    // when
    const viewView = await prepareViewPointer(builderView, { metaLookup })

    // then
    expect(viewView.out(hydra.apiDocumentation).value).to.be.undefined
    expect(viewView.out(viewBuilder.source).value).to.be.undefined
  })

  it("can remove projection's limit/offset", async () => {
    // given
    const builderView = await testData`
      <>
        ${view.dimension} [
          ${view.from} [
            ${view.source} [ ${view.cube} ${ssz('000003')} ] ;
            ${view.path} ${ssz('property/ZEIT')} ;
          ] ;
          ${view.as} ${ssz('property/ZEIT')} ;
        ] ;
        ${view.projection} [
          ${view.limit} 100 ;
          ${view.offset} 100 ;
        ] ;
      .
    `

    // when
    const viewView = await prepareViewPointer(builderView, { removeLimitOffset: true, metaLookup })

    // then
    expect(viewView.out(view.projection).out(view.limit).term).to.be.undefined
    expect(viewView.out(view.projection).out(view.offset).term).to.be.undefined
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
        const viewView = await prepareViewPointer(builderView, { metaLookup })

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

      it('sets view:as to filter dimension', async () => {
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
        const viewView = await prepareViewPointer(builderView, { metaLookup })

        // then
        const viewAs = viewView.out(view.filter).out(view.dimension).out(view.as)
        expect(viewAs.term).to.be.ok
      })
    })

    it('test LookupSource', async () => {
      // given
      const builderView = await testData`
         <https://view-builder.ld.stadt-zuerich.ch/view/BEV355OD3556> a <https://cube.link/view/View> , <https://view-builder.ld.stadt-zuerich.ch/api/View> .
<https://view-builder.ld.stadt-zuerich.ch/view/BEV355OD3556#source-ZAbi2gJpRwRYqCmC-bbz-> a <https://cube.link/view/CubeSource> .
_:genid-451b6a3824d14b4f87dc6aac41ff9e68-b120_b594 a <https://cube.link/view/Dimension> .
_:genid-451b6a3824d14b4f87dc6aac41ff9e68-b120_b596 a <https://cube.link/view/Dimension> .
_:genid-451b6a3824d14b4f87dc6aac41ff9e68-b120_b598 a <https://cube.link/view/Dimension> .
_:genid-451b6a3824d14b4f87dc6aac41ff9e68-b120_b600 a <https://cube.link/view/Dimension> .
_:genid-451b6a3824d14b4f87dc6aac41ff9e68-b120_b602 a <https://cube.link/view/Dimension> .
_:genid-451b6a3824d14b4f87dc6aac41ff9e68-b120_b604 a <https://cube.link/view/Dimension> .
_:genid-451b6a3824d14b4f87dc6aac41ff9e68-b120_b606 a <https://cube.link/view/Dimension> .
<https://view-builder.ld.stadt-zuerich.ch/view/BEV355OD3556> <https://view-builder.described.at/publish> true ;
  <http://schema.org/sameAs> <https://ld.stadt-zuerich.ch/statistics/view/BEV355OD3556> ;
  <http://schema.org/author> <https://view-builder.ld.stadt-zuerich.ch/user/sszmop> ;
  <http://schema.org/name> "Umzüge innerhalb der Stadt nach Stadtkreis, Stadtquartier, Geschlecht, Altersgruppe und Zivilstand, seit 1993" ;
  <http://schema.org/alternateName> "BEV355OD3556" ;
  <https://cube.link/view/projection> _:genid-451b6a3824d14b4f87dc6aac41ff9e68-A01D607A7481EE9EC8EEBCFC8080507F ;
  <https://view-builder.described.at/source> <https://view-builder.ld.stadt-zuerich.ch/view/BEV355OD3556#source-ZAbi2gJpRwRYqCmC-bbz-> .
<https://view-builder.ld.stadt-zuerich.ch/view/BEV355OD3556#source-ZAbi2gJpRwRYqCmC-bbz-> <http://www.w3.org/2000/01/rdf-schema#label> "Wirtschaftliche Umzüge nach Umzugsquartier, Umzugskreis, 10-Jahres-Altersklasse, Geschlecht und Zivilstand" .
_:genid-451b6a3824d14b4f87dc6aac41ff9e68-b120_b594 <http://www.w3.org/2000/01/rdf-schema#label> "Measure Umzüge von Personen (wirtschaftlich) (Wirtschaftliche Umzüge nach Umzugsquartier, Umzugskreis, 10-Jahres-Altersklasse, Geschlecht und Zivilstand)" .
_:genid-451b6a3824d14b4f87dc6aac41ff9e68-b120_b596 <http://www.w3.org/2000/01/rdf-schema#label> "Key Zeit" .
_:genid-451b6a3824d14b4f87dc6aac41ff9e68-b120_b598 <http://www.w3.org/2000/01/rdf-schema#label> "Key Raum" .
_:genid-451b6a3824d14b4f87dc6aac41ff9e68-b120_b600 <http://www.w3.org/2000/01/rdf-schema#label> "Key Ort" .
_:genid-451b6a3824d14b4f87dc6aac41ff9e68-b120_b602 <http://www.w3.org/2000/01/rdf-schema#label> "Key Alter" .
_:genid-451b6a3824d14b4f87dc6aac41ff9e68-b120_b604 <http://www.w3.org/2000/01/rdf-schema#label> "Key Geschlecht" .
_:genid-451b6a3824d14b4f87dc6aac41ff9e68-b120_b606 <http://www.w3.org/2000/01/rdf-schema#label> "Key Zivilstand" .
<https://view-builder.ld.stadt-zuerich.ch/view/BEV355OD3556#source-ZAbi2gJpRwRYqCmC-bbz-> <https://cube.link/view/cube> <https://ld.stadt-zuerich.ch/statistics/000230> ;
  <https://view-builder.described.at/keyFigure> <https://ld.stadt-zuerich.ch/statistics/measure/UMZ> .
<https://view-builder.ld.stadt-zuerich.ch/view/BEV355OD3556> <https://cube.link/view/dimension> _:genid-451b6a3824d14b4f87dc6aac41ff9e68-b120_b594 , _:genid-451b6a3824d14b4f87dc6aac41ff9e68-b120_b596 , _:genid-451b6a3824d14b4f87dc6aac41ff9e68-b120_b598 , _:genid-451b6a3824d14b4f87dc6aac41ff9e68-b120_b600 , _:genid-451b6a3824d14b4f87dc6aac41ff9e68-b120_b602 , _:genid-451b6a3824d14b4f87dc6aac41ff9e68-b120_b604 , _:genid-451b6a3824d14b4f87dc6aac41ff9e68-b120_b606 .
_:genid-451b6a3824d14b4f87dc6aac41ff9e68-b120_b594 <https://cube.link/view/from> _:genid-451b6a3824d14b4f87dc6aac41ff9e68-b120_b595 .
_:genid-451b6a3824d14b4f87dc6aac41ff9e68-b120_b596 <https://cube.link/view/from> _:genid-451b6a3824d14b4f87dc6aac41ff9e68-b120_b597 .
_:genid-451b6a3824d14b4f87dc6aac41ff9e68-b120_b598 <https://cube.link/view/from> _:genid-451b6a3824d14b4f87dc6aac41ff9e68-b120_b599 .
_:genid-451b6a3824d14b4f87dc6aac41ff9e68-b120_b600 <https://cube.link/view/from> _:genid-451b6a3824d14b4f87dc6aac41ff9e68-b120_b601 .
_:genid-451b6a3824d14b4f87dc6aac41ff9e68-b120_b602 <https://cube.link/view/from> _:genid-451b6a3824d14b4f87dc6aac41ff9e68-b120_b603 .
_:genid-451b6a3824d14b4f87dc6aac41ff9e68-b120_b604 <https://cube.link/view/from> _:genid-451b6a3824d14b4f87dc6aac41ff9e68-b120_b605 .
_:genid-451b6a3824d14b4f87dc6aac41ff9e68-b120_b606 <https://cube.link/view/from> _:genid-451b6a3824d14b4f87dc6aac41ff9e68-b120_b607 .
_:genid-451b6a3824d14b4f87dc6aac41ff9e68-b120_b594 <https://view-builder.described.at/generated> true .
_:genid-451b6a3824d14b4f87dc6aac41ff9e68-b120_b596 <https://view-builder.described.at/generated> true .
_:genid-451b6a3824d14b4f87dc6aac41ff9e68-b120_b598 <https://view-builder.described.at/generated> true .
_:genid-451b6a3824d14b4f87dc6aac41ff9e68-b120_b600 <https://view-builder.described.at/generated> true .
_:genid-451b6a3824d14b4f87dc6aac41ff9e68-b120_b602 <https://view-builder.described.at/generated> true .
_:genid-451b6a3824d14b4f87dc6aac41ff9e68-b120_b604 <https://view-builder.described.at/generated> true .
_:genid-451b6a3824d14b4f87dc6aac41ff9e68-b120_b606 <https://view-builder.described.at/generated> true .
_:genid-451b6a3824d14b4f87dc6aac41ff9e68-b120_b595 <https://cube.link/view/source> <https://view-builder.ld.stadt-zuerich.ch/view/BEV355OD3556#source-ZAbi2gJpRwRYqCmC-bbz-> .
_:genid-451b6a3824d14b4f87dc6aac41ff9e68-b120_b597 <https://cube.link/view/source> <https://view-builder.ld.stadt-zuerich.ch/view/BEV355OD3556#source-ZAbi2gJpRwRYqCmC-bbz-> .
_:genid-451b6a3824d14b4f87dc6aac41ff9e68-b120_b599 <https://cube.link/view/source> <https://view-builder.ld.stadt-zuerich.ch/view/BEV355OD3556#source-ZAbi2gJpRwRYqCmC-bbz-> .
_:genid-451b6a3824d14b4f87dc6aac41ff9e68-b120_b601 <https://cube.link/view/source> <https://view-builder.ld.stadt-zuerich.ch/view/BEV355OD3556#source-ZAbi2gJpRwRYqCmC-bbz-> .
_:genid-451b6a3824d14b4f87dc6aac41ff9e68-b120_b603 <https://cube.link/view/source> <https://view-builder.ld.stadt-zuerich.ch/view/BEV355OD3556#source-ZAbi2gJpRwRYqCmC-bbz-> .
_:genid-451b6a3824d14b4f87dc6aac41ff9e68-b120_b605 <https://cube.link/view/source> <https://view-builder.ld.stadt-zuerich.ch/view/BEV355OD3556#source-ZAbi2gJpRwRYqCmC-bbz-> .
_:genid-451b6a3824d14b4f87dc6aac41ff9e68-b120_b607 <https://cube.link/view/source> <https://view-builder.ld.stadt-zuerich.ch/view/BEV355OD3556#source-ZAbi2gJpRwRYqCmC-bbz-> .
_:genid-451b6a3824d14b4f87dc6aac41ff9e68-b120_b595 <https://cube.link/view/path> <https://ld.stadt-zuerich.ch/statistics/measure/UMZ> .
_:genid-451b6a3824d14b4f87dc6aac41ff9e68-b120_b597 <https://cube.link/view/path> <https://ld.stadt-zuerich.ch/statistics/property/ZEIT> .
_:genid-451b6a3824d14b4f87dc6aac41ff9e68-b120_b599 <https://cube.link/view/path> <https://ld.stadt-zuerich.ch/statistics/property/RAUM> .
_:genid-451b6a3824d14b4f87dc6aac41ff9e68-b120_b601 <https://cube.link/view/path> <https://ld.stadt-zuerich.ch/statistics/property/ORT> .
_:genid-451b6a3824d14b4f87dc6aac41ff9e68-b120_b603 <https://cube.link/view/path> <https://ld.stadt-zuerich.ch/statistics/property/ALT> .
_:genid-451b6a3824d14b4f87dc6aac41ff9e68-b120_b605 <https://cube.link/view/path> <https://ld.stadt-zuerich.ch/statistics/property/SEX> .
_:genid-451b6a3824d14b4f87dc6aac41ff9e68-b120_b607 <https://cube.link/view/path> <https://ld.stadt-zuerich.ch/statistics/property/ZIV> .
<https://view-builder.ld.stadt-zuerich.ch/view/BEV355OD3556> <http://schema.org/isBasedOn> <https://ld.stadt-zuerich.ch/statistics/meta/object/75> ;
  <https://ld.stadt-zuerich.ch/schema/metadataCreator> <https://view-builder.ld.stadt-zuerich.ch/user/sszmop> .
_:genid-451b6a3824d14b4f87dc6aac41ff9e68-A01D607A7481EE9EC8EEBCFC8080507F <https://cube.link/view/limit> 100 .

        `

      // when
      const viewView = await prepareViewPointer(builderView.namedNode('https://view-builder.ld.stadt-zuerich.ch/view/BEV355OD3556'), { metaLookup })

      // then
      const viewAs = viewView.out(view.filter).out(view.dimension).out(view.as)
      expect(viewAs.term).to.be.ok
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

        viewView = await prepareViewPointer(builderView, { metaLookup })
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

        const raum = dimension
          .any()
          .has(view.path, ssz('property/RAUM'))
          .in(view.from)
        const joined = dimension.out(view.join)
        expect(joined.term).to.deep.eq(raum.term)
      })
    })

    context('IRI dimension', () => {
      context('with single source', () => {
        context('when dimension is sh:IRI', () => {
          let viewView

          beforeEach(async () => {
            // given
            metaLookup.isIriDimension.resolves(true)

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
            viewView = await prepareViewPointer(builderView, { metaLookup })
          })

          it('generates a join for schema:name and schema:termCode when dimension is sh:IRI', async function () {
            const query = createViewQuery(viewView)

            // then
            expect(query).to.matchSnapshot(this)
          })

          it('marks schema:name join dimension as label for its IRI dimension', () => {
            const iriDimension = viewView.any()
              .has(view.path, ssz('property/RAUM'))
              .in(view.from)
              .term

            const labelDimension = viewView.any()
              .has(view.path, schema.name)
              .in(view.from)

            expect(labelDimension.out(view.labelFor).term).to.deep.eq(iriDimension)
          })
        })

        it('does not generate joins for when dimension is not sh:IRI', async function () {
          // given
          metaLookup.isIriDimension.resolves(false)

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
          const viewView = await prepareViewPointer(builderView, { metaLookup })
          const query = createViewQuery(viewView)

          // then
          expect(query).to.matchSnapshot(this)
        })
      })

      context('with multiple sources', () => {
        it('generates a join for schema:name and schema:termCode when dimension is sh:IRI', async function () {
          // given
          metaLookup.isIriDimension.resolves(true)

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
          const viewView = await prepareViewPointer(builderView, { metaLookup })
          const query = createViewQuery(viewView)

          // then
          expect(query).to.matchSnapshot(this)
        })
      })
    })
  })
})
