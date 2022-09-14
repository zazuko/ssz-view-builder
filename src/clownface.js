import $rdf from '@rdfjs/dataset'
import Traverser from '@rdfjs/traverser'
import clownface from 'clownface'

export function newReference(ptr) {
  return clownface({
    dataset: $rdf.dataset([...ptr.dataset]),
    term: ptr.term,
  })
}

const subgraph = new Traverser(({ level, quad }) => {
  return level === 0 || quad.subject.termType === 'BlankNode'
}, { factory: $rdf })

export function deleteCbd(ptr) {
  for (const quad of subgraph.match(ptr)) {
    ptr.dataset.delete(quad)
  }
}
