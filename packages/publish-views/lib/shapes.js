import onetime from 'onetime'
import $rdf from 'barnard59-env'
import { schema, sh } from '@tpluscode/rdf-ns-builders'
import { createRequire } from 'module'
import concat from 'barnard59-base/concat.js'

const require = createRequire(import.meta.url)
const metadataShapesPath = require.resolve('../shapes.ttl')
const viewShapesPath = require.resolve('@view-builder/core/shape/ViewValidationShape.ttl')

export const viewShape = onetime(async () => {
  const dataset = await $rdf.dataset().import($rdf.fromFile(metadataShapesPath))

  return $rdf.clownface({ dataset })
    .has(sh.targetClass, schema.Dataset)
})

export function validationShapes() {
  const metadataShapes = $rdf.fromFile(metadataShapesPath)
  const viewShapes = $rdf.fromFile(viewShapesPath)

  return concat.object(metadataShapes, viewShapes)
}
