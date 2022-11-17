import { expect } from 'chai'
import { view } from '@view-builder/core/ns.js'
import { testData } from '@view-builder/testing'
import { schema } from '@tpluscode/rdf-ns-builders'
import SparqlClient from '@view-builder/testing/SparqlClient.js'
import { MetaLookup } from '../../lib/metaLookup.js'

describe('@view-builder/view-util/lib/metaLookup.js', () => {
  let metaLookup
  let client

  beforeEach(() => {
    client = new SparqlClient()
    metaLookup = new MetaLookup(client)
  })

  describe('MetaLookup', () => {
    describe('isIriDimension', () => {
      it('runs a check across all cubes', async function () {
        // given
        const dimension = await testData`
          <>
            ${view.path} ${schema.name} ;
            ${view.from} [
              ${view.source} [
                ${view.cube} <#CUBE1> ;
              ] , [
                ${view.cube} <#CUBE2> ;
              ] ;
            ] ;
          .
        `

        // when
        await metaLookup.isIriDimension(dimension)

        // then
        const query = client.query.ask.firstCall.firstArg
        expect(query).to.matchSnapshot(this)
      })

      it('runs a check from single cubes', async function () {
        // given
        const dimension = await testData`
          <>
            ${view.path} ${schema.name} ;
            ${view.from} [
              ${view.cube} <#CUBE> ;
            ] ;
          .
        `

        // when
        await metaLookup.isIriDimension(dimension)

        // then
        const query = client.query.ask.firstCall.firstArg
        expect(query).to.matchSnapshot(this)
      })
    })
  })
})
