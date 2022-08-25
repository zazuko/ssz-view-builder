import { hydra } from '@tpluscode/rdf-ns-builders'
import ParsingClient from 'sparql-http-client/ParsingClient.js'

export const endpoint = 'https://ld.integ.stadt-zuerich.ch/query'

export const client = new ParsingClient({
  endpointUrl: endpoint,
})

export function getSparqlUrl(query, template) {
  const url = new URL(endpoint)
  url.searchParams.append('query', query)

  return template
    .out(hydra.mapping)
    .out(hydra.variable)
    .toArray()
    .reduce((encoded, { value }) => {
      return encoded.replace(new RegExp(`%7B${value}%7D`, 'g'), `{${value}}`)
    }, url.toString())
}
