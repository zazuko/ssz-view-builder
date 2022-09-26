import { toSparql } from 'clownface-shacl-path'
import clownface from 'clownface'
import $rdf from '@rdfjs/dataset'
import { rdf } from '@tpluscode/rdf-ns-builders'
import { ssz, view } from '@view-builder/core/ns.js'

export default {
  editor: ssz.FilterDimensionViewer,
  init({ focusNode, value }, { update }) {
    const baseDimension = focusNode.out(ssz.baseDimension)
    const expectedDimension = createFilterDimension(baseDimension, focusNode)
    const expectedPath = getSparqlStringForPath(expectedDimension.out(view.from).out(view.path))

    const currentPath = getSparqlStringForPath(value.object?.out(view.from).out(view.path))

    if (expectedPath && expectedPath !== currentPath) {
      update(expectedDimension)
    }

    return true
  },
  render({ value }) {
    const path = value.object?.out(view.from).out(view.path)

    return getSparqlStringForPath(path)
  },
}

function createFilterDimension(baseDimension, focusNode) {
  const dimension = clownface({ dataset: $rdf.dataset() }).blankNode()
  const deepPath = focusNode.out(ssz.drillDownProperty).term
  const basePath = baseDimension.out(view.from).out(view.path).term

  dimension
    .addOut(rdf.type, [view.Dimension, ssz.FilterDimension])
    .addOut(view.from, (from) => {
      from.addOut(view.source, baseDimension.out(view.from).out(view.source))

      if (deepPath) {
        from.addList(view.path, [basePath, deepPath])
      } else {
        from.addOut(view.path, basePath)
      }
    })

  return dimension
}

function getSparqlStringForPath(pointer) {
  try {
    return toSparql(pointer).toString({ prologue: true })
  } catch {
    return ''
  }
}
