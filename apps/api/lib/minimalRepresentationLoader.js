import { CONSTRUCT } from '@tpluscode/sparql-builder'

export default ({ req, term }) => CONSTRUCT`?s ?p ?o`
  .FROM(term)
  .WHERE`?s ?p ?o`
  .execute(req.labyrinth.sparql.query)
