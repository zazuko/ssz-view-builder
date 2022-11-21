import * as ns from '@view-builder/core/ns.js'
import { ASK } from '@tpluscode/sparql-builder'
import { VALUES } from '@tpluscode/sparql-builder/expressions'
import { sh } from '@tpluscode/rdf-ns-builders'
import TermMap from '@rdfjs/term-map'
import { cubeQuery } from '../query/cubeQuery.js'
import dimensionIdentifiersQuery from '../query/dimensionIdentifiers.rq'
import getCubeKeys from '../query/cubeKeys.rq'
import constructAttributes from '../query/attributes.rq'

export class MetaLookup {
  constructor(client) {
    this.client = client
  }

  /**
   * Runs a query to find if the given view:dimension (its path)
   * is annotated as `sh:nodeKind sh:IRI` in the cube shape
   */
  isIriDimension(dimension) {
    const cubes = dimension
      .out(ns.view.from)
      .out(ns.view.source)
      .out(ns.view.cube)
      .terms.map(cube => ({ cube }))
    const path = dimension.out(ns.view.from).out(ns.view.path)

    return ASK`
      ${VALUES(...cubes)}
      
      ?cube ${ns.cube.observationConstraint}/${sh.property} ?dimension .
      ?dimension ${sh.path} ${path.term} ; ${sh.nodeKind} ${sh.IRI} .
    `.execute(this.client.query)
  }

  async getCubeKeys(...cubes) {
    const values = cubes.map(cube => ({ cube }))
    const query = await cubeQuery(getCubeKeys, ...values)
    return this.client.query.select(query.toString())
  }

  async getDimensionIdentifiers() {
    if (!this._dimensionIdentifiers) {
      const query = await cubeQuery(dimensionIdentifiersQuery)
      const results = await this.client.query.select(query.toString())

      // eslint-disable-next-line arrow-body-style
      this._dimensionIdentifiers = results.reduce((mapped, { dimension, identifier, type }) => {
        return mapped.set(dimension, { identifier: identifier.value, type })
      }, new TermMap())
    }

    return this._dimensionIdentifiers
  }

  async getDataAttributes(view, datenobjekt) {
    const constructAttributesQuery = await cubeQuery(constructAttributes, { view, datenobjekt })

    return this.client.query.construct(constructAttributesQuery.toString())
  }
}
