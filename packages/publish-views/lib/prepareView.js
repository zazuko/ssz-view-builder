import { prepareViewPointer } from '@view-builder/view-util'
import { _void, dcat, dcterms, rdf, schema } from '@tpluscode/rdf-ns-builders'
import { getMetadataClient } from './sparql.js'

export default async function (pointer) {
  const prepareOptions = {
    removeEventListener: true,
    rename: true,
    removeLimitOffset: true,
  }

  if (this.variables.has('cubeLookup')) {
    prepareOptions.cubeLookup = this.variables.get('cubeLookup')
  } else {
    prepareOptions.client = getMetadataClient(this.variables)
  }

  const view = await prepareViewPointer(pointer, prepareOptions)

  view
    .addOut(rdf.type, [dcat.Dataset, _void.Dataset])
    .deleteOut(schema.author)

  view.addIn(schema.dataset, view.namedNode(this.variables.get('well-known-views-dataset')))

  view.addOut(dcat.distribution, (rdfDistribution) => {
    rdfDistribution
      .addOut(rdf.type, dcat.Distribution)
      .addOut(dcterms.format, 'RDF')
      .addOut(dcat.mediaType, 'application/n-triples')
      .addOut(dcat.downloadURL, view.namedNode(`${view.value}/observation/`))
  })
  view.addOut(dcat.distribution, (csvDistribution) => {
    csvDistribution
      .addOut(rdf.type, dcat.Distribution)
      .addOut(dcterms.format, 'CSV')
      .addOut(dcat.mediaType, 'text/csv')
      .addOut(dcat.downloadURL, view.namedNode(`${view.value}/observation/?format=csv`))
  })

  return view
}
