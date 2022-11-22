import { hydra } from '@tpluscode/rdf-ns-builders'

export function getSparqlUrl({ query, template, client }) {
  const url = new URL(client.query.endpoint.endpointUrl)
  url.searchParams.append('query', query)

  return template
    .out(hydra.mapping)
    .out(hydra.variable)
    .toArray()
    .reduce((encoded, { value }) => encoded.replace(new RegExp(`%7B${value}%7D`, 'g'), `{${value}}`), url.toString())
}
