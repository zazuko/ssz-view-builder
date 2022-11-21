import { schema } from '@tpluscode/rdf-ns-builders'
import { CONSTRUCT } from '@tpluscode/sparql-builder'
import fromStream from 'rdf-dataset-ext/fromStream.js'
import { IriTemplateBundle } from '@rdfine/hydra/bundles'
import { fromPointer } from '@rdfine/hydra/lib/IriTemplate'
import { viewBuilder } from '@view-builder/core/ns.js'
import RdfResource from '@tpluscode/rdfine'
import $rdf from 'rdf-ext'

RdfResource.factory.addMixin(...IriTemplateBundle)

const metadataCreator = $rdf.namedNode('https://ld.stadt-zuerich.ch/schema/metadataCreator')

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

    const template = fromPointer(req.knossos.config.out(viewBuilder.publishedViewTemplate))
    const publishedUri = template.expand(pointer)
    pointer.addOut(schema.sameAs, pointer.namedNode(publishedUri))
  }
}

function constructMetadata(pointer, sourceDataset, userBase) {
  const view = pointer.term

  return CONSTRUCT`
    ${view} ${schema.alternateName} ?alternateName ;
            ${schema.name} ?name ;
            ${metadataCreator} ?metadataCreatorUser .
    `
    .WHERE`
      SERVICE <${process.env.METADATA_ENDPOINT}> {
        ${sourceDataset} ${schema.alternateName} ?alternateName ;
                         ${schema.name} ?name ;
                         ${metadataCreator} ?metadataCreator .
                         
        BIND( CONCAT("${userBase}", str(?metadataCreator)) as ?metadataCreatorUser)
      }
    `
}

export function setAuthor({ req, pointer }) {
  pointer.addOut(schema.author, req.agent.term)
}
