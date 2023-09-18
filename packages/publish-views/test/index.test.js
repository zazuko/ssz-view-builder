import fs from 'fs/promises'
import path from 'path'
import { expect } from 'chai'
import { fileURLToPath } from 'url'
import { testData } from '@view-builder/testing'
import { cube, view, viewBuilder } from '@view-builder/core/ns.js'
import { _void, dcat, foaf, rdfs, schema } from '@tpluscode/rdf-ns-builders'
import { MetaLookup } from '@view-builder/view-util/lib/metaLookup.js'
import sinon from 'sinon'
import $rdf from 'rdf-ext'
import { toNtriples } from '../index.js'
import { ValidationError } from '../lib/ValidationError.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.join(__dirname, '../output')

describe('@view-builder/publish-views', () => {
  describe('pipeline', () => {
    let metaLookup

    beforeEach(async () => {
      metaLookup = sinon.createStubInstance(MetaLookup)
      metaLookup.getDimensionIdentifiers.resolves(new Map())
      metaLookup.getDataAttributes.resolves([])
      metaLookup.getCubeKeys.resolves([])

      for (const file of await fs.readdir(outDir)) {
        // eslint-disable-next-line no-await-in-loop
        await fs.unlink(path.join(outDir, file))
      }
    })

    context('successful job', () => {
      it('does not generate a SHACL report', async () => {
        // given
        const ptr = await testData`
          <>
            a ${view.View}, ${schema.Dataset} ;
            ${schema.isBasedOn} <https://example.com/view/meta> ;
            ${schema.sameAs} <https://example.com/published/view> ;
            ${view.dimension} [
              ${view.from} [
                ${view.path} ${foaf.name} ;
                ${view.source} [
                  ${view.cube} <http://foo.cube> ;
                ] ;
              ] ;
            ] ;
          .
          
          <https://example.com/published/view>
            a ${dcat.Dataset}, ${_void.Dataset} ;
            ${schema.name} "Test view" ;
            ${schema.alternateName} "TEST" ;
          .
        `

        // when
        const { run } = await runPipeline(ptr)

        // then
        await expect(run.finished).to.be.eventually.fulfilled
      })

      it('when dimension has generated lookup dimensions', async () => {
        // given
        metaLookup.isIriDimension.resolves(true)
        // given
        const ptr = await testData`
          <>
            a ${view.View}, ${schema.Dataset} ;
            ${schema.sameAs} <https://example.com/published/view> ;
            ${view.dimension} [
              ${view.from} [
                ${view.path} ${schema.knows} ;
                ${view.source} [
                  ${view.cube} <http://foo.cube> ;
                ] ;
              ] ;
            ] ;
          .
          
          <https://example.com/published/view>
            a ${dcat.Dataset}, ${_void.Dataset} ;
            ${schema.name} "Test view" ;
            ${schema.identifier} "TEST" ;
          .
        `

        // when
        const { run } = await runPipeline(ptr)

        // then
        await expect(run.finished).to.be.eventually.fulfilled
      })

      it('when linked source cube is not found', async () => {
        // given
        const measure = $rdf.namedNode('https://ld.stadt-zuerich.ch/statistics/measure/BEW')
        metaLookup.getDimensionIdentifiers.resolves($rdf.termMap([
          [measure, { identifier: 'bew_alt_plz', type: cube.MeasureDimension }],
        ]))

        const ptr = await testData`
          <>
            a ${view.View}, ${schema.Dataset} ;
            ${schema.isBasedOn} <https://example.com/view/meta> ;
            ${schema.sameAs} <https://example.com/published/view> ;
            ${schema.name} "Test" ;
            ${view.dimension} [
              ${rdfs.label} "Measure" ;
              ${view.from} [
                ${view.source} [
                  a ${view.CubeSource} ;
                  ${view.cube} <https://ld.stadt-zuerich.ch/statistics/000486> ;
                  ${viewBuilder.keyFigure} <https://ld.stadt-zuerich.ch/statistics/measure/BEW> ;
                ] ;
                ${view.path} <https://ld.stadt-zuerich.ch/statistics/measure/BEW> ;
              ] ;
            ] ;
          .`

        // when
        const { run } = await runPipeline(ptr)

        // then
        await expect(run.finished).to.be.eventually.fulfilled
      })
    })

    context('unsuccessful job', () => {
      it('report error when view does not have metadata', async () => {
        // given
        const ptr = await testData`
          <>
            a ${view.View}, ${schema.Dataset} ;
            ${schema.isBasedOn} <https://example.com/view/meta> ;
            ${schema.sameAs} <https://example.com/published/view> ; 
          .`

        // when
        const { run } = await runPipeline(ptr)

        // then
        await expect(run.finished).to.be.rejectedWith(ValidationError, '1 views failed. 3 issues found')
      })
    })

    function runPipeline(...views) {
      const outFile = path.join(outDir, 'views.nt')
      const loadViewsStepsPath = path.join(__dirname, 'steps/loadMockViews.ttl')

      return toNtriples({
        outFile,
        loadViewsStepsPath,
        variables: {
          views,
          metaLookup,
          ignoreWarnings: true,
        },
      })
    }
  })
})
