import onetime from 'onetime'
import { fromFile } from 'rdf-utils-fs'
import $rdf from 'rdf-ext'
import clownface from 'clownface'
import { schema, sh } from '@tpluscode/rdf-ns-builders'
import { createRequire } from 'module'
import concat from 'barnard59-base/concat.js'

const require = createRequire(import.meta.url)
const metadataShapesPath = require.resolve('../shapes.ttl')
const viewShapesPath = require.resolve('@view-builder/core/shape/ViewValidationShape.ttl')

export const viewShape = onetime(async () => {
  const dataset = await $rdf.dataset().import(fromFile(metadataShapesPath))

  return clownface({ dataset })
    .has(sh.targetClass, schema.Dataset)
})

export function validationShapes() {
  const metadataShapes = fromFile(metadataShapesPath)
  const viewShapes = fromFile(viewShapesPath)

  return concat.object(metadataShapes, viewShapes)
}
