import { rdf, sh } from '@tpluscode/rdf-ns-builders'
import $rdf from 'rdf-ext'
import clownface from 'clownface'

export class ValidationError extends Error {
  constructor(reports) {
    const total = reports.reduce((sum, { pointer }) => {
      const violations = pointer.any().has(sh.resultSeverity).terms.length
      return sum + violations
    }, 0)

    super(`${reports.length} views failed. ${total} issues found`)

    Object.defineProperty(this, 'dataset', {
      enumerable: false,
      value: combineReports(reports),
    })
    Object.defineProperty(this, 'reports', {
      enumerable: false,
      value: clownface({ dataset: this.dataset })
        .has(rdf.type, sh.ValidationReport),
    })
  }
}

function combineReports(reports) {
  const dataset = $rdf.dataset()

  reports.forEach(({ pointer }, index) => {
    dataset.addAll([...pointer.dataset].map(prefixBlankNodes(`r${index}`)))
  })

  return dataset
}

function prefixBlankNodes(prefix) {
  function prefixBlankNode(term) {
    if (term.termType === 'BlankNode') {
      return $rdf.blankNode(`${prefix}_${term.value}`)
    }

    return term
  }
  return ({ subject, predicate, object, graph }) => $rdf.quad(
    prefixBlankNode(subject),
    predicate,
    prefixBlankNode(object),
    graph,
  )
}
