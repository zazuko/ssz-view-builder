import env from '@zazuko/env'
import View from 'rdf-cube-view-query/lib/View.js'
import * as ns from '@view-builder/core/ns.js'
import { rdf, schema } from '@tpluscode/rdf-ns-builders'
import { ssz } from '@view-builder/core/ns.js'
import { createFilterDimension, generateLookupSources } from './lib/filters.js'
import { removeApiProperties, sourcesToBlankNodes, rebase } from './lib/viewGraph.js'
import { getColumns } from './lib/projection.js'
import { MetaLookup } from './lib/metaLookup.js'
import { populateDimensionIdentifiers, ensureViewAsProperty } from './lib/dimensions.js'

export async function prepareViewPointer(pointer, options = {}) {
  const {
    cleanup = true,
    removeLimitOffset,
    rename,
    client,
    metaLookup = new MetaLookup(client),
    $rdf = env,
  } = options

  let dataset = $rdf.dataset([...pointer.dataset])
  if (cleanup) {
    dataset = sourcesToBlankNodes(dataset, $rdf)
  }

  let view = $rdf.clownface({ dataset }).node(pointer)
  view.deleteOut(ssz.metadataCreator)

  if (rename) {
    view = rebase(view)
    view.deleteOut(schema.sameAs).deleteOut(schema.isBasedOn)
  }

  const filters = view.out(ns.view.filter).toArray()
  for (const filter of filters) {
    const termSetFilter = filter.has(ns.viewBuilder.filterTermSet)
    if (termSetFilter.term) {
      generateLookupSources(filter)
    } else {
      createFilterDimension(filter)
    }
  }

  const columns = [...await getColumns(view, metaLookup)]
  view.addOut(ns.view.dimension, columns)
  const projection = view.out(ns.view.projection)
  projection.addList(ns.view.columns, columns)

  if (removeLimitOffset) {
    projection.deleteOut([ns.view.limit, ns.view.offset])
  }

  view.addOut(ns.view.dimension, view.out(ns.view.filter).out(ns.view.dimension))

  await populateDimensionIdentifiers(view, metaLookup)
  ensureViewAsProperty(view)
  dataset.addAll(await metaLookup.getDataAttributes(view.term, pointer.out(schema.isBasedOn).term))

  if (cleanup) {
    dataset = dataset.filter(removeApiProperties)
  }

  return $rdf.clownface({ dataset })
    .node(view)
    .addOut(rdf.type, schema.Dataset)
}

export function createViewQuery(pointer) {
  const view = new View(pointer)

  return view.observationsQuery().query.toString()
}
