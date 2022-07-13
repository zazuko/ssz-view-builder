import { hydra } from '@tpluscode/rdf-ns-builders'

const endpoint = 'https://ld.stadt-zuerich.ch/query'

export function getSparqlUrl(query, template) {
  const url = new URL(endpoint)
  url.searchParams.append('query', query)

  return template
    .out(hydra.mapping)
    .out(hydra.variable)
    .toArray()
    .reduce((encoded, { value }) => {
      return encoded.replace(`%7B${value}%7D`, `{${value}}`)
    }, url.toString())
}
