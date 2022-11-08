import { CONSTRUCT, SELECT } from '@tpluscode/sparql-builder'
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

  const views = await SELECT`?viewBuilderView ?publishedView ?metaObject`
    .WHERE`
      ?viewBuilderView 
        a ${ns.view.View} ;
        ${schema.sameAs} ?publishedView ; 
        ${schema.isBasedOn} ?metaObject ;
        ${ns.viewBuilder.publish} true ;
    `
    .execute(client.query)

  return views.pipe(through2.obj(async function (bindings, _, next) {
    const { viewBuilderView, publishedView, metaObject } = bindings

    const viewQuads = await CONSTRUCT`?s ?p ?o`
      .FROM(viewBuilderView)
      .WHERE`?s ?p ?o`
      .execute(client.query)
    const metaQuads = await loadViewMeta(publishedView, metaObject, metaClient)

    const dataset = $rdf.dataset()
    await Promise.all([dataset.import(viewQuads), dataset.import(metaQuads)])
    this.push(clownface({ dataset, term: viewBuilderView }))

    next()
  }))
}

async function loadViewMeta(publishedView, metaObject, client) {
  const shape = await viewShape()

  const subjectVariable = 'view'
  const query = shapeTo.construct(shape, { focusNode: metaObject, subjectVariable })
  const metaStream = await query.execute(client.query)

  return metaStream.pipe(through2.obj(viewIdTransform(metaObject, publishedView)))
}

function viewIdTransform(from, to) {
  const rename = term => (term.equals(from) ? to : from)

  return function renameToPublishedView(quad, cb, next) {
    const subject = rename(quad.subject)
    const predicate = rename(quad.predicate)
    const object = rename(quad.object)

    this.push($rdf.quad(subject, predicate, object))
    next()
  }
}

function createClient(variables) {
  return new StreamClient({
    endpointUrl: variables.get('SPARQL_ENDPOINT'),
    user: variables.get('SPARQL_USER'),
    password: variables.get('SPARQL_PASSWORD'),
  })
}
