import { schema } from '@tpluscode/rdf-ns-builders'
import { CONSTRUCT } from '@tpluscode/sparql-builder'
import fromStream from 'rdf-dataset-ext/fromStream.js'

/**
 * Queries the metadata endpoint to load necessary metadata for a view
 *
 * @param req
 * @param pointer The payload, which is new instance of `</api/View>`
 */
export async function importMetadata({ req, pointer }) {
  const sourceDataset = pointer.out(schema.isBasedOn).term
  const view = pointer.term

  if (sourceDataset) {
    const metadata = await CONSTRUCT`
      ${view} ${schema.identifier} ?identifier ;
              ${schema.alternateName} ?alternateName ;
              ${schema.name} ?name .
    `
      .WHERE`
        SERVICE <${process.env.METADATA_ENDPOINT}> {
          ${sourceDataset} ${schema.identifier} ?identifier ;
                           ${schema.alternateName} ?alternateName ;
                           ${schema.name} ?name .
        }
      `.execute(req.labyrinth.sparql.query)

    await fromStream(pointer.dataset, metadata)
  }
}
