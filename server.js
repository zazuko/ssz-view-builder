import express from 'express'
import fallback from 'express-history-api-fallback'
import conditional from 'express-conditional-middleware'
import knossos from '@hydrofoil/knossos'
import compression from 'compression'

const app = express()

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
  name: 'view-builder',
  user: process.env.SPARQL_USER,
  password: process.env.SPARQL_PASSWORD,
})
app.use('/', apis)

app.listen(parseInt(process.env.PORT, 10) || 8080)
