import { hydra } from '@tpluscode/rdf-ns-builders'

export const endpoint = 'https://ld.integ.stadt-zuerich.ch/query'

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
