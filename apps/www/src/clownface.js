import $rdf from '@view-builder/core/env.js'
import Traverser from '@rdfjs/traverser'
import TermSet from '@rdfjs/term-set'

export function newReference(ptr) {
  return $rdf.clownface({
    dataset: $rdf.dataset([...ptr.dataset]),
    term: ptr.term,
  })
}

const subgraph = new Traverser(({ level, quad }) => level === 0 || quad.subject.termType === 'BlankNode', { factory: $rdf })

export function deleteCbd(ptr) {
  for (const quad of subgraph.match(ptr)) {
    ptr.dataset.delete(quad)
  }
}

export function getAllTriplesFromRoot(ptr) {
  const visited = new TermSet()
  const traverser = new Traverser(({ quad }) => !visited.has(quad.subject), { factory: $rdf })
  return traverser.match(ptr)
}
