import { SELECT } from '@tpluscode/sparql-builder'
import $rdf from '@view-builder/core/env.js'
import { VALUES } from '@tpluscode/sparql-builder/expressions'
import * as ns from '@view-builder/core/ns.js'

/**
 *
 * @returns {Array<{
 *   dimension: import('@rdfjs/types').Term;
 *   label: import('@rdfjs/types').Literal
 * }>}
 */
export function findMeasureDimensions(cube, client) {
  return SELECT.DISTINCT`?dimension ?label`
    .WHERE`
      ${cube} ${ns.cube.observationConstraint}/${$rdf.ns.sh.property}/${$rdf.ns.sh.path} ?dimension .

      optional { ?dimension ${$rdf.ns.schema.name} ?label . }

      ?dimension a ${ns.cube.MeasureDimension}
    `.execute(client.query)
}

/**
 *
 * @returns {Array<{
 *   cube: import('@rdfjs/types').Term;
 *   dimension: import('@rdfjs/types').Term;
 *   label: import('@rdfjs/types').Literal
 * }>}
 */
export function findKeyDimensions(cubes, client) {
  const cubeValues = cubes.map(cube => ({ cube }))

  return SELECT`?cube ?dimension ?label`
    .WHERE`
      ${VALUES(...cubeValues)}

      ?cube ${ns.cube.observationConstraint}/${$rdf.ns.sh.property}/${$rdf.ns.sh.path} ?dimension .

      optional { ?dimension ${$rdf.ns.schema.name} ?label . }

      ?dimension a ${ns.cube.KeyDimension}
    `.execute(client.query)
}
