import $rdf from 'rdf-ext';
import clownface from 'clownface';

export function newReference(ptr) {
  return clownface({
    dataset: $rdf.dataset([...ptr.dataset]),
    term: ptr.term,
  })

}

export function deleteCbd(ptr) {
  ptr.out().forEach(child => {
    if (child.term.termType === 'BlankNode') {
      deleteCbd(child)
    }
    child.deleteIn(ptr)
  })
}
