import { expect } from 'chai'
import { view } from '@view-builder/core/ns.js'
import { testData } from '@view-builder/testing'
import { schema } from '@tpluscode/rdf-ns-builders'
import SparqlClient from '@view-builder/testing/SparqlClient.js'
import { CubeLookup } from '../../lib/cubeLookup.js'

describe('@view-builder/view-util/lib/cubeLookup.js', () => {
  let cubeLookup
  let client

  beforeEach(() => {
    client = new SparqlClient()
    cubeLookup = new CubeLookup(client)
  })

  describe('CubeLookup', () => {
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
        await cubeLookup.isIriDimension(dimension)

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
        await cubeLookup.isIriDimension(dimension)

        // then
        const query = client.query.ask.firstCall.firstArg
        expect(query).to.matchSnapshot(this)
      })
    })
  })
})
