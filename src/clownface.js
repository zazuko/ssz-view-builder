import $rdf from '@rdfjs/dataset'
import clownface from 'clownface'

export function newReference(ptr) {
  return clownface({
    dataset: $rdf.dataset([...ptr.dataset]),
    term: ptr.term,
  })
}

export function deleteCbd(ptr) {
  function deleteQuads(dataset, term) {
    for (const quad of dataset.match(term)) {
      ptr.dataset.delete(quad)
      if (quad.object.termType === 'BlankNode') {
        deleteQuads(dataset, quad.object)
      }
    }
  }

  deleteQuads(ptr.dataset, ptr.term)
}
