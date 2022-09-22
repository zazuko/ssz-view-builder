import { schema } from '@tpluscode/rdf-ns-builders'
import { SELECT } from '@tpluscode/sparql-builder'
import getStream from 'get-stream'

export async function importMetadata({ req, pointer }) {
  const sourceDataset = pointer.out(schema.isBasedOn).term
  if (sourceDataset) {
    const [result] = await getStream.array(await SELECT`?identifier ?alternateName ?name`
      .WHERE`
        SERVICE <${process.env.METADATA_ENDPOINT}> {
          ${sourceDataset} ${schema.identifier} ?identifier .
          ${sourceDataset} ${schema.alternateName} ?alternateName .
          ${sourceDataset} ${schema.name} ?name .
        }
      `.execute(req.labyrinth.sparql.query))

    if (result) {
      pointer.addOut(schema.identifier, result.identifier)
      pointer.addOut(schema.alternateName, result.alternateName)
      pointer.addOut(schema.name, result.name)
    }
  }
}
