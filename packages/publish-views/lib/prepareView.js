import { prepareViewPointer } from '@view-builder/view-util'
import { dcat, dcterms, rdf } from '@tpluscode/rdf-ns-builders'

export default function (pointer) {
  const view = prepareViewPointer(pointer, {
    removeEventListener: true,
    rename: true,
    removeLimitOffset: true,
  })

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
