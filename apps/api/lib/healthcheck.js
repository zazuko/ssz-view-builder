import { ASK, DELETE } from '@tpluscode/sparql-builder'
import StreamClient from 'sparql-http-client'
import { hydra } from '@tpluscode/rdf-ns-builders'
import asyncMiddleware from 'middleware-async'

const viewBuilderClient = new StreamClient({
  endpointUrl: process.env.SPARQL_ENDPOINT,
  updateUrl: process.env.SPARQL_UPDATE_ENDPOINT,
  user: process.env.SPARQL_USER,
  password: process.env.SPARQL_PASSWORD,
})

const publishingStoreClient = new StreamClient({
  endpointUrl: process.env.PUBLIC_ENDPOINT,
  updateUrl: process.env.PUBLIC_UPDATE_ENDPOINT,
  user: process.env.PUBLIC_ENDPOINT_USER,
  password: process.env.PUBLIC_ENDPOINT_PASSWORD,
})

export default asyncMiddleware(async (req, res, next) => {
  try {
    const result = await ASK`
      ${req.rdf.namedNode('/api')} a ${hydra.ApiDocumentation}
    `
      .execute(viewBuilderClient.query)

    if (!result) {
      return next('API Documentation resource not found in view builder database')
    }
  } catch (e) {
    req.knossos.log(e)
    return next('Failed to connect to view builder database for reading')
  }

  try {
    await DELETE.DATA`
      GRAPH <urn:health:check> {
        <urn:healthcheck:s> <urn:healthcheck:p> <urn:healthcheck:o>
      }
    `
      .execute(viewBuilderClient.query)
  } catch (e) {
    req.knossos.log(e)
    return next('Failed to connect to view builder database for writing')
  }

  try {
    await ASK`?s ?p ?o`.execute(publishingStoreClient.query)
  } catch (e) {
    req.knossos.log(e)
    return next('Failed to connect to publishing database')
  }

  return res.end()
})
