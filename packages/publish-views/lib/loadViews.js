import { CONSTRUCT, SELECT } from '@tpluscode/sparql-builder'
import * as ns from '@view-builder/core/ns.js'
import through2 from 'through2'
import $rdf from 'rdf-ext'
import clownface from 'clownface'
import { schema } from '@tpluscode/rdf-ns-builders'
import * as shapeTo from '@hydrofoil/shape-to-query'
import { viewShape } from './shapes.js'
import { getViewBuilderClient, getMetadataClient } from './sparql.js'

export default async function loadViewsToPublish() {
  const client = getViewBuilderClient(this.variables)
  const metaClient = getMetadataClient(this.variables)

  const views = await SELECT`?viewBuilderView ?publishedView`
    .WHERE`
      ?viewBuilderView 
        a ${ns.view.View} ;
        ${schema.sameAs} ?publishedView ; 
        ${ns.viewBuilder.publish} true ;
    `
    .execute(client.query)

  return views.pipe(through2.obj(async function ({ viewBuilderView, publishedView }, _, next) {
    const viewQuads = await CONSTRUCT`?s ?p ?o`
      .FROM(viewBuilderView)
      .WHERE`?s ?p ?o`
      .execute(client.query)
    const metaQuads = await loadViewMeta(publishedView, metaClient)

    const dataset = $rdf.dataset()
    await Promise.all([dataset.import(viewQuads), dataset.import(metaQuads)])
    this.push(clownface({ dataset, term: viewBuilderView }))

    next()
  }))
}

async function loadViewMeta(view, client) {
  const shape = await viewShape()

  const subjectVariable = 'view'
  const query = shapeTo.construct(shape, { focusNode: view, subjectVariable })

  return query.execute(client.query)
}
