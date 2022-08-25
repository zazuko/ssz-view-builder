import { rdfs, rdf } from '@tpluscode/rdf-ns-builders'
import TermMap from '@rdfjs/term-map'
import * as dimensionQueries from './queries/dimensions.js'
import * as ns from './ns.js'
import { deleteCbd, newReference } from './clownface.js'

export async function generateDimensions(view, queries = dimensionQueries) {
  const sources = view.out(ns.ssz.source)

  clearGeneratedDimensions(view)

  await createMeasureDimensions(view, sources, queries)
  await createKeyDimensions(view, sources, queries)

  // create a new pointer reference
  // to force form re-render
  return newReference(view)
}

async function createKeyDimensions(view, sources, { findKeyDimensions }) {
  const results = await findKeyDimensions(sources.out(ns.view.cube).terms)

  const dimensions = results.reduce((map, { cube, dimension, label }) => {
    const value = map.get(dimension) || { label, sources: [] }
    value.sources.push(sources.has(ns.view.cube, cube).term)

    map.set(dimension, value)
    return map
  }, new TermMap())

  for (const [dimension, { label, sources }] of dimensions) {
    view.addOut(ns.view.dimension, viewDim => {
      viewDim
        .addOut(rdf.type, ns.view.Dimension)
        .addOut(ns.ssz.generated, true)
        .addOut(ns.view.from, from => {
          from.addOut(ns.view.source, sources)
            .addOut(ns.view.path, dimension)
        })

      if (label) {
        viewDim.addOut(rdfs.label, `Key ${label.value}`)
      }
    })
  }
}

async function createMeasureDimensions(view, sources, { findMeasureDimensions }) {
  const dimensions = await Promise.all(
    sources.map(async source => {
      const cube = source.out(ns.view.cube).term
      return {
        source,
        measures: await findMeasureDimensions(cube),
      }
    }),
  )

  for (const { source, measures } of dimensions) {
    for (const { dimension, label } of measures) {
      view.addOut(ns.view.dimension, viewDim => {
        viewDim
          .addOut(rdf.type, ns.view.Dimension)
          .addOut(ns.ssz.generated, true)
          .addOut(ns.view.from, from => {
            from.addOut(ns.view.source, source)
              .addOut(ns.view.path, dimension)
          })

        if (label) {
          viewDim.addOut(rdfs.label, `Measure ${label.value} (${source.out(rdfs.label).value})`)
        }
      })
    }
  }
}

function clearGeneratedDimensions(view) {
  const generatedDimensions = view.out(ns.view.dimension)
    .has(ns.ssz.generated, true)

  generatedDimensions.forEach(dim => {
    dim.deleteIn(ns.view.dimension)
    deleteCbd(dim)
  })
}
