import * as ns from '@view-builder/core/ns.js'
import { rdf, schema } from '@tpluscode/rdf-ns-builders'

/**
 * Iterated view dimensions and return a set of columns to set as `view:projection/view:columns`.
 *
 * For every dimension whose values are IRIs, yields a additional lookup dimension
 * which join their `schema:label` and `schema:termCode`.
 */
export async function getColumns(view, metaLookup) {
  const dimensions = await Promise.all(view.out(ns.view.dimension)
    .map(async dimension => ({
      dimension,
      needsLookupDimensions: await metaLookup.isIriDimension(dimension),
    })))

  return (function * iterate() {
    let i = 0
    function nextColumnProperty() {
      i += 1
      return view.namedNode(`${view.value}#column${i}`)
    }

    for (const { dimension, needsLookupDimensions } of dimensions) {
      dimension.addOut(ns.view.as, nextColumnProperty())
      yield dimension

      if (needsLookupDimensions) {
        const labelDimension = view.blankNode()

        labelDimension
          .addOut(ns.view.as, nextColumnProperty())
          .addOut(ns.view.labelFor, dimension)
          .addOut(ns.view.from, (from) => {
            from.addOut(ns.view.source, (source) => {
              source.addOut(rdf.type, ns.view.LookupSource)
            })
            from.addOut(ns.view.path, schema.name)
            from.addOut(ns.view.join, dimension)
          })

        yield labelDimension

        const termCodeDimension = view.blankNode()

        termCodeDimension
          .addOut(ns.view.as, nextColumnProperty())
          .addOut(ns.view.from, (from) => {
            from.addOut(ns.view.source, (source) => {
              source.addOut(rdf.type, ns.view.LookupSource)
            })
            from.addOut(ns.view.path, schema.termCode)
            from.addOut(ns.view.join, dimension)
          })

        yield termCodeDimension
      }
    }
  })()
}
