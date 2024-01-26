import $rdf from '@view-builder/core/env.js'

export function getSparqlUrl({ query, template, client }) {
  const url = new URL(client.query.endpoint.endpointUrl)
  url.searchParams.append('query', query)

  return template
    .out($rdf.ns.hydra.mapping)
    .out($rdf.ns.hydra.variable)
    .toArray()
    .reduce((encoded, { value }) => encoded.replace(new RegExp(`%7B${value}%7D`, 'g'), `{${value}}`), url.toString())
}
