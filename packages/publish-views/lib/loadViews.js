import { DESCRIBE, SELECT } from '@tpluscode/sparql-builder'
import * as ns from '@view-builder/core/ns.js'
import through2 from 'through2'
import $rdf from 'rdf-ext'
import clownface from 'clownface'
import StreamClient from 'sparql-http-client'
import { schema } from '@tpluscode/rdf-ns-builders'
import * as shapeTo from '@hydrofoil/shape-to-query'
import { viewShape } from './shapes.js'

export default async function loadViewsToPublish() {
  const client = this.variables.get('client') || createClient(this.variables)
  const metaClient = new StreamClient({
    endpointUrl: this.variables.get('METADATA_ENDPOINT'),
  })

  const views = await SELECT`?view ?destination`
    .WHERE`
      ?view 
        a ${ns.view.View} ;
        ${schema.sameAs} ?destination ; 
        ${ns.viewBuilder.publish} true ;
    `
    .execute(client.query)

  return views.pipe(through2.obj(async function ({ view, destination }, _, next) {
    const viewQuads = await DESCRIBE`${view}`.execute(client.query)
    const metaQuads = await loadViewMeta(destination, metaClient)

    const dataset = $rdf.dataset()
    await Promise.all([dataset.import(viewQuads), dataset.import(metaQuads)])
    this.push(clownface({ dataset, term: view }))

    next()
  }))
}

async function loadViewMeta(view, client) {
  const shape = await viewShape()

  const subjectVariable = 'view'
  const query = shapeTo.construct(shape, { focusNode: view, subjectVariable })

  return query.execute(client.query)
}

function createClient(variables) {
  return new StreamClient({
    endpointUrl: variables.get('SPARQL_ENDPOINT'),
    user: variables.get('SPARQL_USER'),
    password: variables.get('SPARQL_PASSWORD'),
  })
}
