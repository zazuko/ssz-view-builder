import through2 from 'through2'
import { ValidationError } from './ValidationError.js'

const REPORTS_KEY = 'COMBINED_SHACL_REPORTS'

export function combineShaclReports({ context, report }) {
  const variables = context.variables.has(REPORTS_KEY)
    ? context.variables
    : context.variables.set(REPORTS_KEY, [])

  variables.get(REPORTS_KEY).push(report)

  // continue stream
  return true
}

export function failOnAnyViolations() {
  const { variables } = this

  return through2.obj(function (chunk, _, next) {
    this.push(chunk)
    next()
  }, function (done) {
    const reports = variables.get(REPORTS_KEY)
    if (reports?.length) {
      this.destroy(new ValidationError(reports))
    }

    done()
  })
}
