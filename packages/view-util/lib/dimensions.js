import * as ns from '@view-builder/core/ns.js'
import { schema } from '@tpluscode/rdf-ns-builders'
import TermMap from '@rdfjs/term-map'

const expandedProperties = new TermMap([
  [schema.name, 'lang'],
  [schema.termCode, 'code'],
])

export async function populateDimensionIdentifiers(pointer, metaLookup) {
  const cubes = pointer
    .out(ns.view.dimension)
    .out(ns.view.from)
    .out(ns.view.source)
    .out(ns.view.cube)
    .terms

  const cubesAndKeys = await metaLookup.getCubeKeys(...cubes)
  const dimensionIdentifiers = await metaLookup.getDimensionIdentifiers()

  pointer
    .out(ns.view.dimension)
    .forEach((dimension) => {
      const from = dimension.out(ns.view.from)
      const property = from.out(ns.view.path).term
      const cube = from.out(ns.view.source).out(ns.view.cube).terms.shift()

      if (!property) {
        return
      }

      if (!cube) {
        // maybe a lookup source
        const joinedProperty = from.out(ns.view.join).out(ns.view.from).out(ns.view.path).term
        const { identifier } = dimensionIdentifiers.get(joinedProperty) || {}
        const suffix = expandedProperties.get(property) || '?'

        dimension.addOut(schema.identifier, `${identifier}_${suffix}`)
        return
      }

      // else cube source
      const { identifier, type } = dimensionIdentifiers.get(property) || {}

      if (ns.cube.MeasureDimension.equals(type)) {
        const found = cubesAndKeys.find(bindings => cube.equals(bindings.cube))

        if (found) {
          dimension.addOut(schema.identifier, found.cubeKey)
        }
      } else if (ns.cube.KeyDimension.equals(type)) {
        dimension.addOut(schema.identifier, `${identifier}_uri`)
      }
    })
}

export function ensureViewAsProperty(view) {
  let i = 0
  function nextColumnProperty() {
    i += 1
    return view.namedNode(`${view.value}#column${i}`)
  }

  const dimensions = view.out(ns.view.dimension).toArray()

  for (const dimension of dimensions) {
    dimension
      .deleteOut(ns.view.as)
      .addOut(ns.view.as, nextColumnProperty())
  }
}
