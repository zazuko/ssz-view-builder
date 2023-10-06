import through2 from 'through2'
import { sh } from '@tpluscode/rdf-ns-builders'
import { ValidationError } from './ValidationError.js'

const REPORTS_KEY = 'COMBINED_SHACL_REPORTS'

export function collectShaclReports({ context, report }) {
  context.variables.has(REPORTS_KEY) ||
    context.variables.set(REPORTS_KEY, [])

  context.variables.get(REPORTS_KEY).push(report)

  // continue stream
  return true
}

export function failOnAnyViolations() {
  const { variables, logger } = this
  const ignoreWarnings = variables.get('ignoreWarnings')

  return through2.obj(function (chunk, _, next) {
    this.push(chunk)
    next()
  }, function (done) {
    const reports = variables.get(REPORTS_KEY, { allowMissing: true })
    if (reports?.some(hasViolations(ignoreWarnings))) {
      const error = new ValidationError(reports)
      logger.error(error.dataset.toString())
      this.destroy(error)
    }

    done()
  })
}

function hasViolations(ignoreWarnings) {
  return (report) => {
    const violationsCount = report.pointer.any()
      .has(sh.resultSeverity, sh.Violation).terms.length
    const warningsCount = report.pointer.any()
      .has(sh.resultSeverity, sh.Warning).terms.length

    return violationsCount > 0 || (warningsCount > 0 && !ignoreWarnings)
  }
}
