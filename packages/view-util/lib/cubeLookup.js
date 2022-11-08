import * as ns from '@view-builder/core/ns.js'
import { ASK } from '@tpluscode/sparql-builder'
import { VALUES } from '@tpluscode/sparql-builder/expressions'
import { sh } from '@tpluscode/rdf-ns-builders'

export class CubeLookup {
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
}
