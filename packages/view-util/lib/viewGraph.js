import * as ns from '@view-builder/core/ns.js'
import { hydra, rdf } from '@tpluscode/rdf-ns-builders'
import $rdf from 'rdf-ext'
import TermMap from '@rdfjs/term-map'

const viewBuilderNs = ns.viewBuilder().value
const hydraNs = hydra().value

export function removeApiProperties({ predicate }) {
  const url = predicate.value

  return !url.startsWith(viewBuilderNs) && !url.startsWith(hydraNs)
}

export function sourcesToBlankNodes(dataset) {
  function isSource(term) {
    return dataset.match(term, rdf.type, ns.view.CubeSource).size > 0
  }

  const map = new TermMap()
  function toBlank(term) {
    if (!map.has(term)) {
      map.set(term, $rdf.blankNode())
    }

    return map.get(term)
  }

  return dataset.map((quad) => {
    let { subject, predicate, object, graph } = quad
    if (isSource(subject)) {
      subject = toBlank(subject)
    }
    if (isSource(object)) {
      object = toBlank(object)
    }

    return $rdf.quad(subject, predicate, object, graph)
  })
}
