import $rdf from 'rdf-ext'
import clownface from 'clownface'
import asyncMiddleware from 'middleware-async'
import { hydra, rdf, rdfs, schema } from '@tpluscode/rdf-ns-builders'
import { CONSTRUCT } from '@tpluscode/sparql-builder'
import { cube } from '@zazuko/vocabulary-extras/builders'

/**
 * GET handler for loading view metadata from the metadata endpoint
 *
 * The response is a hydra collection
 */
export const get = asyncMiddleware(async (req, res) => {
  const collection = clownface({
    dataset: $rdf.dataset(),
    term: req.hydra.term,
  })
    .addOut(rdf.type, hydra.Collection)

  const members = await CONSTRUCT`
    ${collection.term} ${hydra.member} ?view .
    ?view ${rdfs.label} ?label
  `.WHERE`
    SERVICE <${process.env.METADATA_ENDPOINT}> {
      ?view a ${schema.Dataset} ;
            ${schema.name} ?label ;
            ${schema.alternateName} ?uniqueId ;
      .
    }
    
    FILTER NOT EXISTS {
      [
        # Exclude views which already exist in view builder
        a ${cube('view/View')} ; ${schema.isBasedOn} ?view
      ]
    }
  `.execute(req.labyrinth.sparql.query)

  await collection.dataset.import(members)

  res.resource(collection)
})
