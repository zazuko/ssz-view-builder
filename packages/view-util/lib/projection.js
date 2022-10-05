import * as ns from '@view-builder/core/ns.js'
import { rdf, schema } from '@tpluscode/rdf-ns-builders'

/**
 * Iterated view dimensions and return a set of columns to set as `view:projection/view:columns`.
 *
 * For every dimension whose values are IRIs, yields a new label lookup dimension.
 * Otherwise, yields the dimension itself.
 */
export async function getColumns(view, cubeLookup) {
  const dimensions = await Promise.all(view.out(ns.view.dimension)
    .map(async dimension => ({
      dimension,
      isIri: await cubeLookup.isIriDimension(dimension),
    })))

  return (function * iterate() {
    for (const { dimension, isIri } of dimensions) {
      if (isIri) {
        const labelDimension = view.blankNode()

        labelDimension
          .addOut(ns.view.from, (from) => {
            from.addOut(ns.view.source, (source) => {
              source.addOut(rdf.type, ns.view.LookupSource)
            })
            from.addOut(ns.view.path, schema.name)
            from.addOut(ns.view.join, dimension)
          })

        yield labelDimension
      } else {
        yield dimension
      }
    }
  })()
}
