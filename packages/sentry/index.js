import * as Sentry from '@sentry/node'
import * as Tracing from '@sentry/tracing'
import { Router } from 'express'

export function setup(app) {
  Sentry.init({
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Tracing.Integrations.Express({ app }),
    ],
    tracesSampleRate: 1.0,
  })
}

export function beforeHandler() {
  return Router().use(Sentry.Handlers.requestHandler(), Sentry.Handlers.tracingHandler())
}

export function errorHandler() {
  return Sentry.Handlers.errorHandler()
}
