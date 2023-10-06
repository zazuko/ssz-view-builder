import { schema } from '@tpluscode/rdf-ns-builders'
import { CONSTRUCT } from '@tpluscode/sparql-builder'
import fromStream from 'rdf-dataset-ext/fromStream.js'
import $rdf from '@view-builder/core/env.js'
import { ssz, viewBuilder } from '@view-builder/core/ns.js'

/**
 * Queries the metadata endpoint to load necessary metadata for a view
 *
 * @param req
 * @param pointer The payload, which is new instance of `</api/View>`
 */
export async function importMetadata({ req, pointer }) {
  const sourceDataset = pointer.out(schema.isBasedOn).term

  if (sourceDataset) {
    const metadataQuery = await constructMetadata(pointer, sourceDataset, req.rdf.namedNode('/user/').value)
    await fromStream(pointer.dataset, await metadataQuery.execute(req.labyrinth.sparql.query))

    const template = $rdf.rdfine.hydra.IriTemplate(
      req.knossos.config.out(viewBuilder.publishedViewTemplate),
    )
    const publishedUri = template.expand(pointer)
    pointer.addOut(schema.sameAs, pointer.namedNode(publishedUri))
  }
}

function constructMetadata(pointer, sourceDataset, userBase) {
  const view = pointer.term

  return CONSTRUCT`
    ${view} ${schema.alternateName} ?alternateName ;
            ${schema.name} ?name ;
            ${ssz.metadataCreator} ?metadataCreatorUser .
    `
    .WHERE`
      SERVICE <${process.env.METADATA_ENDPOINT}> {
        ${sourceDataset} ${schema.alternateName} ?alternateName ;
                         ${schema.name} ?name .
        OPTIONAL {
          ${sourceDataset} ${ssz.metadataCreator} ?metadataCreator .
        }
                         
        BIND( IRI(CONCAT("${userBase}", str(?metadataCreator))) as ?metadataCreatorUser)
      }
    `
}

export function setAuthor({ req, pointer }) {
  pointer.addOut(schema.author, req.agent.term)
}
