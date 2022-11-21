import { sparql } from '@tpluscode/sparql-builder'
import { VALUES } from '@tpluscode/sparql-builder/expressions'

export function cubeQuery(query, ...values) {
  return sparql`${query}
  ${VALUES(...values)}`
}
