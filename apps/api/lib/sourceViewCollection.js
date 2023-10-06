import $rdf from '@view-builder/core/env.js'
import asyncMiddleware from 'middleware-async'
import { hydra, rdf, rdfs, schema } from '@tpluscode/rdf-ns-builders'
import { CONSTRUCT } from '@tpluscode/sparql-builder'
import { cube } from '@zazuko/vocabulary-extras/builders'
import { ssz } from '@view-builder/core/ns.js'

/**
 * GET handler for loading view metadata from the metadata endpoint
 *
 * The response is a hydra collection
 */
export const get = asyncMiddleware(async (req, res) => {
  const collection = $rdf.clownface({
    dataset: $rdf.dataset(),
    term: req.hydra.term,
  })
    .addOut(rdf.type, hydra.Collection)

  const members = await CONSTRUCT`
    ${collection.term} ${hydra.member} ?view .
    ?view ${rdfs.label} ?label
  `.WHERE`
    SERVICE <${process.env.METADATA_ENDPOINT}> {
      ?view a ${ssz.Objekte} ;
            ${schema.name} ?label ;
            ${schema.alternateName} ?uniqueId ;
      .
    }
    
    FILTER NOT EXISTS {
      [
        # Exclude views which already exist in view builder
        a ${cube('view/View')} ; ${schema.alternateName} ?uniqueId
      ]
    }
  `.execute(req.labyrinth.sparql.query)

  await collection.dataset.import(members)

  res.resource(collection)
})
