import { SELECT } from '@tpluscode/sparql-builder'
import { schema, sh } from '@tpluscode/rdf-ns-builders'
import { VALUES } from '@tpluscode/sparql-builder/expressions'
import * as ns from '../ns.js'
import { client } from './index.js'

/**
 *
 * @returns {Array<{
 *   dimension: import('@rdfjs/types').Term;
 *   label: import('@rdfjs/types').Literal
 * }>}
 */
export function findMeasureDimensions(cube) {
  return SELECT.DISTINCT`?dimension ?label`
    .WHERE`
      ${cube} ${ns.cube.observationConstraint}/${sh.property}/${sh.path} ?dimension .

      optional { ?dimension ${schema.name} ?label . }

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
export function findKeyDimensions(cubes) {
  const cubeValues = cubes.map(cube => ({ cube }))

  return SELECT`?cube ?dimension ?label`
    .WHERE`
      ${VALUES(...cubeValues)}

      ?cube ${ns.cube.observationConstraint}/${sh.property}/${sh.path} ?dimension .

      optional { ?dimension ${schema.name} ?label . }

      ?dimension a ${ns.cube.KeyDimension}
    `.execute(client.query)
}
