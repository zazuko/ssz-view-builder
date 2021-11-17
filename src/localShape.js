import clownface from 'clownface'
import { dataset } from '@rdf-esm/dataset'
import { schema } from '@tpluscode/rdf-ns-builders'
import { fromPointer as nodeShape } from '@rdfine/shacl/lib/NodeShape'
import { fromPointer as property } from '@rdfine/shacl/lib/PropertyShape'

export async function loadShape() {
  const shape = clownface({ dataset: dataset() }).blankNode()

  nodeShape(shape, {
    property: property({
      name: 'Given name',
      path: schema.name,
      minCount: 1,
      defaultValue: 'John Doe',
    })
  })

  return shape
}
