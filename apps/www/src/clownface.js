import $rdf from '@view-builder/core/env.js'

export function newReference(ptr) {
  return $rdf.clownface({
    dataset: $rdf.dataset([...ptr.dataset]),
    term: ptr.term,
  })
}

const subgraph = $rdf.traverser(({ level, quad }) => level === 0 || quad.subject.termType === 'BlankNode')

export function deleteCbd(ptr) {
  for (const quad of subgraph.match(ptr)) {
    ptr.dataset.delete(quad)
  }
}

export function getAllTriplesFromRoot(ptr) {
  const visited = $rdf.termSet()
  const traverser = $rdf.traverser(({ quad }) => !visited.has(quad.subject))
  return traverser.match(ptr)
}
