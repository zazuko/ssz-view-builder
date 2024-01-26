import rdf from '@view-builder/core/env.js'
import * as ns from '@view-builder/core/ns.js'
import * as dimensionQueries from './queries/dimensions.js'
import { deleteCbd, newReference } from './clownface.js'

export async function generateDimensions(view, { client, queries = dimensionQueries } = {}) {
  const sources = view.out(ns.viewBuilder.source)

  clearGeneratedDimensions(view)

  await createMeasureDimensions(view, sources, client, queries)
  await createKeyDimensions(view, sources, client, queries)

  // create a new pointer reference
  // to force form re-render
  return newReference(view)
}

async function createKeyDimensions(view, pointer, client, { findKeyDimensions }) {
  const results = await findKeyDimensions(pointer.out(ns.view.cube).terms, client)

  const dimensions = results.reduce((map, { cube, dimension, label }) => {
    const value = map.get(dimension) || { label, sources: [] }
    value.sources.push(pointer.has(ns.view.cube, cube).term)

    map.set(dimension, value)
    return map
  }, rdf.termMap())

  for (const [dimension, { label, sources }] of dimensions) {
    view.addOut(ns.view.dimension, (viewDim) => {
      viewDim
        .addOut(rdf.ns.rdf.type, ns.view.Dimension)
        .addOut(ns.viewBuilder.generated, true)
        .addOut(ns.view.from, (from) => {
          from.addOut(ns.view.source, sources)
            .addOut(ns.view.path, dimension)
        })

      if (label) {
        viewDim.addOut(rdf.ns.rdfs.label, `Key ${label.value}`)
      }
    })
  }
}

async function createMeasureDimensions(view, sources, client, { findMeasureDimensions }) {
  const dimensions = await Promise.all(
    sources.map(async (source) => {
      const cube = source.out(ns.view.cube).term
      return {
        source,
        measures: await findMeasureDimensions(cube, client),
      }
    }),
  )

  for (const { source, measures } of dimensions) {
    for (const { dimension, label } of measures) {
      view.addOut(ns.view.dimension, (viewDim) => {
        viewDim
          .addOut(rdf.ns.rdf.type, ns.view.Dimension)
          .addOut(ns.viewBuilder.generated, true)
          .addOut(ns.view.from, (from) => {
            from.addOut(ns.view.source, source)
              .addOut(ns.view.path, dimension)
          })

        if (label) {
          viewDim.addOut(rdf.ns.rdfs.label, `Measure ${label.value} (${source.out(rdf.ns.rdfs.label).value})`)
        }
      })
    }
  }
}

function clearGeneratedDimensions(view) {
  const generatedDimensions = view.any()
    .has(rdf.ns.rdf.type, ns.view.Dimension)
    .has(ns.viewBuilder.generated, true)

  generatedDimensions.forEach((dim) => {
    dim.deleteIn(ns.view.dimension)
    deleteCbd(dim)
  })
}
