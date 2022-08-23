import { rdf, sh } from '@tpluscode/rdf-ns-builders'
import $rdf from '@rdfjs/dataset'
import clownface from 'clownface'
import { SELECT } from '@tpluscode/sparql-builder'
import { client } from './queries/index.js'
import * as ns from './ns.js'

export async function generateDimensions(view) {
  const sources = view.out(ns.ssz.source)

  clearGeneratedDimensions(view)

  await createMeasureDimensions(view, sources)

  return clownface({
    dataset: $rdf.dataset([...view.dataset]),
    term: view.term,
  })
}

async function createMeasureDimensions(view, sources) {
  const dimensions = await Promise.all(
    sources.map(async source => {
      const cube = source.out(ns.view.cube).term
      return {
        source,
        measures: await findDimensions(cube, ns.cube.MeasureDimension)
      }
    })
  )

  for (const { source, measures } of dimensions) {
    for (const measure of measures) {
      view.addOut(ns.view.dimension, viewDim => {
        viewDim
          .addOut(rdf.type, ns.view.Dimension)
          .addOut(ns.ssz.generated, true)
          .addOut(ns.view.from, from => {
            from.addOut(ns.view.source, source)
                .addOut(ns.view.path, measure)
          })
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

async function findDimensions(cube, type) {
  const results = await SELECT`?dimension`
    .WHERE`
      ${cube} ${ns.cube.observationConstraint}/${sh.property}/${sh.path} ?dimension .
      ?dimension a ${type}
    `.execute(client.query)

  return results.map(({ dimension }) => dimension)
}
