import onetime from 'onetime'
import { fromFile } from 'rdf-utils-fs'
import $rdf from 'rdf-ext'
import path from 'path'
import { fileURLToPath } from 'url'
import clownface from 'clownface'
import { schema, sh } from '@tpluscode/rdf-ns-builders'
import { createRequire } from 'module'
import concat from 'barnard59-base/concat.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const shapePath = path.join(__dirname, '../shapes.ttl')
const require = createRequire(import.meta.url)

export const viewShape = onetime(async () => {
  const dataset = await $rdf.dataset().import(fromFile(shapePath))

  return clownface({ dataset })
    .has(sh.targetClass, schema.Dataset)
})

export function validationShapes() {
  const metadataShapes = fromFile(require.resolve('../shapes.ttl'))
  const viewShapes = fromFile(require.resolve('@view-builder/core/shape/ViewValidationShape.ttl'))

  return concat.object(metadataShapes, viewShapes)
}
