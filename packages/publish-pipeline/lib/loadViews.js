import { DESCRIBE, SELECT } from '@tpluscode/sparql-builder'
import * as ns from '@view-builder/core/ns.js'
import through2 from 'through2'
import $rdf from 'rdf-ext'
import clownface from 'clownface'

export default async function loadViewsToPublish() {
  const client = this.variables.get('client')

  const views = await SELECT`?view`
    .WHERE`
      ?view a ${ns.view.View} ; ${ns.viewBuilder.publish} true ;
    `
    .execute(client.query)

  return views.pipe(through2.obj(async function ({ view }, _, next) {
    const viewQuads = await DESCRIBE`${view}`.execute(client.query)

    const dataset = await $rdf.dataset().import(viewQuads)
    this.push(clownface({ dataset, term: view }))

    next()
  }))
}
