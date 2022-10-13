import Runner from 'barnard59/runner.js'
import fromFile from 'rdf-utils-fs/fromFile.js'
import $rdf from 'rdf-ext'
import clownface from 'clownface'
import path from 'path'
import { fileURLToPath } from 'url'
import { PassThrough } from 'stream'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pipelinePath = path.join(__dirname, 'pipeline.ttl')

export async function publish(client) {
  const dataset = await $rdf.dataset().import(fromFile(pipelinePath))
  const pipeline = clownface({ dataset }).namedNode('')

  const variables = new Map([
    ['client', client],
  ])

  const outputStream = new PassThrough({ objectMode: true })
  await Runner(pipeline, {
    basePath: __dirname,
    variables,
    outputStream,
  })

  return outputStream
}
