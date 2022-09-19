import { DESCRIBE } from '@tpluscode/sparql-builder'
import { sh } from '@tpluscode/rdf-ns-builders'

export function shapesQuery({ types, sparql }) {
  return DESCRIBE`?shape`
    .WHERE`
      {
        VALUES ?shape { ${types} }
        ?shape a ${sh.NodeShape} .
      }
      UNION
      {
        VALUES ?type { ${types} }
      
        ?shape ${sh.targetClass} ?type .
      }
    `
    .execute(sparql.query)
}
