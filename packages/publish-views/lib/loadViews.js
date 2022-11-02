import { CONSTRUCT, SELECT } from '@tpluscode/sparql-builder'
import * as ns from '@view-builder/core/ns.js'
import through2 from 'through2'
import $rdf from 'rdf-ext'
import clownface from 'clownface'
import StreamClient from 'sparql-http-client'

export default async function loadViewsToPublish() {
  const client = this.variables.get('client') || createClient(this.variables)

  const views = await SELECT`?view`
    .WHERE`
      ?view a ${ns.view.View} ; ${ns.viewBuilder.publish} true ;
    `
    .execute(client.query)

  return views.pipe(through2.obj(async function ({ view }, _, next) {
    const viewQuads = await CONSTRUCT`?s ?p ?o`
      .FROM(view)
      .WHERE`?s ?p ?o`
      .execute(client.query)

    const dataset = await $rdf.dataset().import(viewQuads)
    this.push(clownface({ dataset, term: view }))

    next()
  }))
}

function createClient(variables) {
  return new StreamClient({
    endpointUrl: variables.get('SPARQL_ENDPOINT'),
    user: variables.get('SPARQL_USER'),
    password: variables.get('SPARQL_PASSWORD'),
  })
}
