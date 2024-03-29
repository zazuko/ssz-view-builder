import { CONSTRUCT, SELECT } from '@tpluscode/sparql-builder'
import * as ns from '@view-builder/core/ns.js'
import through2 from 'through2'
import $rdf from 'barnard59-env'
import * as shapeTo from '@hydrofoil/shape-to-query'
import { viewShape } from './shapes.js'
import { getViewBuilderClient, getMetadataClient } from './sparql.js'

export default async function loadViewsToPublish() {
  const client = getViewBuilderClient(this.variables)
  const metaClient = getMetadataClient(this.variables)

  const views = await SELECT`?viewBuilderView ?publishedView ?metaObject`
    .WHERE`
      ?viewBuilderView 
        a ${ns.view.View} ;
        ${$rdf.ns.schema.sameAs} ?publishedView ; 
        ${$rdf.ns.schema.isBasedOn} ?metaObject ;
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
    this.push($rdf.clownface({ dataset, term: viewBuilderView }))

    next()
  }))
}

async function loadViewMeta(publishedView, metaObject, client) {
  const shape = await viewShape()

  const subjectVariable = 'view'
  const query = shapeTo.constructQuery(shape, { focusNode: metaObject, subjectVariable })
  const quads = await query.execute(client.query, {
    operation: 'postDirect',
  })

  return $rdf.dataset(quads).toStream()
    .pipe(through2.obj(viewIdTransform(metaObject, publishedView)))
}

function viewIdTransform(from, to) {
  const rename = term => (term.equals(from) ? to : term)

  return function renameToPublishedView(quad, cb, next) {
    const subject = rename(quad.subject)
    const predicate = rename(quad.predicate)
    const object = rename(quad.object)
    const graph = rename(quad.graph)

    this.push($rdf.quad(subject, predicate, object, graph))
    next()
  }
}
