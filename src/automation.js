import { rdfs, rdf, sh, schema } from '@tpluscode/rdf-ns-builders'
import $rdf from '@rdfjs/dataset'
import clownface from 'clownface'
import { SELECT } from '@tpluscode/sparql-builder'
import { VALUES } from '@tpluscode/sparql-builder/expressions'
import TermMap from '@rdfjs/term-map'
import { client } from './queries/index.js'
import * as ns from './ns.js'

export async function generateDimensions(view) {
  const sources = view.out(ns.ssz.source)

  clearGeneratedDimensions(view)

  await createMeasureDimensions(view, sources)
  await createKeyDimensions(view, sources, ns.cube.KeyDimension)

  return clownface({
    dataset: $rdf.dataset([...view.dataset]),
    term: view.term,
  })
}

async function createKeyDimensions(view, sources) {
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

async function createMeasureDimensions(view, sources) {
  const dimensions = await Promise.all(
    sources.map(async source => {
      const cube = source.out(ns.view.cube).term
      return {
        source,
        measures: await findMeasureDimensions(cube)
      }
    })
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

function deleteCbd(ptr) {
  ptr.out().forEach(child => {
    if (child.term.termType === 'BlankNode') {
      deleteCbd(child)
    }
    child.deleteIn(ptr)
  })  
}

async function findMeasureDimensions(cube) {
  return await SELECT.DISTINCT`?dimension ?label`
    .WHERE`
      ${cube} ${ns.cube.observationConstraint}/${sh.property}/${sh.path} ?dimension .

      optional { ?dimension ${schema.name} ?label . }

      ?dimension a ${ns.cube.MeasureDimension}
    `.execute(client.query)
}

async function findKeyDimensions(cubes) {
  const cubeValues = cubes.map(cube => ({ cube }))

  return await SELECT`?cube ?dimension ?label`
    .WHERE`
      ${VALUES(...cubeValues)}

      ?cube ${ns.cube.observationConstraint}/${sh.property}/${sh.path} ?dimension .

      optional { ?dimension ${schema.name} ?label . }

      ?dimension a ${ns.cube.KeyDimension}
    `.execute(client.query)
}
