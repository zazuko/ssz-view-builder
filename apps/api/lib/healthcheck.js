/* eslint-disable no-console */
import { ASK } from '@tpluscode/sparql-builder'
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
  user: process.env.PUBLIC_ENDPOINT_USER,
  password: process.env.PUBLIC_ENDPOINT_PASSWORD,
})

const metadataEndpoint = new StreamClient({
  endpointUrl: process.env.METADATA_ENDPOINT,
})

export default asyncMiddleware(async (req, res, next) => {
  try {
    const result = await ASK`
      <${process.env.API_BASE}/api> a ${hydra.ApiDocumentation}
    `
      .execute(viewBuilderClient.query)

    if (!result) {
      return next('API Documentation resource not found in view builder database')
    }
  } catch (e) {
    console.log(e)
    return next('Failed to connect to view builder database for reading')
  }

  /* try {
    await DELETE.DATA`
      GRAPH <urn:health:check> {
        <urn:healthcheck:s> <urn:healthcheck:p> <urn:healthcheck:o>
      }
    `
      .execute(viewBuilderClient.query)
  } catch (e) {
    console.log(e)
    return next('Failed to connect to view builder database for writing')
  } */

  try {
    await ASK`?s ?p ?o`.execute(publishingStoreClient.query)
  } catch (e) {
    console.log(e)
    return next('Failed to connect to publishing database')
  }

  try {
    await ASK`?s ?p ?o`.execute(metadataEndpoint.query)
  } catch (e) {
    console.log(e)
    return next('Failed to connect to metadata database')
  }

  return res.end()
})
