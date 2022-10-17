import Runner from 'barnard59/runner.js'
import fromFile from 'rdf-utils-fs/fromFile.js'
import $rdf from 'rdf-ext'
import clownface from 'clownface'
import path from 'path'
import { fileURLToPath } from 'url'
import { PassThrough } from 'stream'

const __dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), 'pipeline')
const pipelinePath = path.join(__dirname, 'main.ttl')
const storeStepsPath = path.join(__dirname, 'to-store.ttl')
const ntriplesStepsPath = path.join(__dirname, 'to-ntriples.ttl')

export function toNtriples(client, variables) {
  return getStream({
    client,
    term: 'ToNtriples',
    outStepsPath: ntriplesStepsPath,
    variables,
  })
}

export async function toStore(client, variables) {
  return getStream({
    client,
    term: 'ToStore',
    outStepsPath: storeStepsPath,
    variables,
  })
}

async function getStream({ client, term, outStepsPath, variables = [] }) {
  const dataset = await $rdf.dataset().import(fromFile(pipelinePath))
  await dataset.import(fromFile(outStepsPath))
  const pipeline = clownface({ dataset }).namedNode(term)

  const outputStream = new PassThrough()
  await Runner(pipeline, {
    basePath: __dirname,
    variables: new Map([
      ['client', client],
      ...variables,
    ]),
    outputStream,
  })

  return outputStream
}
