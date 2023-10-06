/* eslint-disable class-methods-use-this */
import { ProblemDocument } from 'http-problem-details'
import rdf from '@view-builder/core/env.js'
import { hex } from '@hydrofoil/vocabularies/builders'

export class ValidationErrorMapper {
  get error() {
    return 'ValidationError'
  }

  mapError(error) {
    const report = error.reports.map(ptr => rdf.rdfine.sh.ValidationReport(ptr).toJSON())

    const problem = new ProblemDocument({
      title: 'Data issues were found',
      detail: error.message,
      status: 400,
    }, {
      '@context': {
        '@vocab': hex().value,
      },
      report,
    })

    problem.title = 'Data issues were found'
    return problem
  }
}
