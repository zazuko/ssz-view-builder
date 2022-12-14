import express from 'express'
import fallback from 'express-history-api-fallback'
import conditional from 'express-conditional-middleware'
import knossos from '@hydrofoil/knossos'
import compression from 'compression'
import healthcheck from '@view-builder/api/lib/healthcheck.js'
import * as Sentry from '@view-builder/sentry'

const app = express()

Sentry.setup(app)

app.enable('trust proxy')
app.use(compression())
const root = './apps/www/dist'
app.use('/app', express.static(root))
app.use('/app', conditional(
  req => req.accepts('html'),
  fallback('index.html', { root }),
))

const apis = knossos.default({
  endpointUrl: `${process.env.SPARQL_ENDPOINT}`,
  updateUrl: `${process.env.SPARQL_UPDATE_ENDPOINT}`,
  name: 'view-builder',
  user: process.env.SPARQL_USER,
  password: process.env.SPARQL_PASSWORD,
})

app.get('/api/health', healthcheck)

app.get('/', conditional(
  req => req.accepts('html'),
  (req, res) => res.redirect('/app'),
))
app.use('/', apis)

app.listen(parseInt(process.env.PORT, 10) || 8080)
