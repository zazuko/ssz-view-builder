import onetime from 'onetime'
import { fromFile } from 'rdf-utils-fs'
import $rdf from 'rdf-ext'
import path from 'path'
import { fileURLToPath } from 'url'
import clownface from 'clownface'
import { schema, sh } from '@tpluscode/rdf-ns-builders'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const shapePath = path.join(__dirname, '../shapes.ttl')

export const viewShape = onetime(async () => {
  const dataset = await $rdf.dataset().import(fromFile(shapePath))

  return clownface({ dataset })
    .has(sh.targetClass, schema.Dataset)
})
