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
const fileStepsPath = path.join(__dirname, 'to-file.ttl')

export function toNtriples(client, tempFile, variables) {
  return startRun({
    client,
    term: 'ToFile',
    outSteps: [ntriplesStepsPath, fileStepsPath],
    variables: [
      ['outfile', tempFile],
      ...Object.entries(variables),
    ],
  })
}

export async function toStore(client, variables) {
  return startRun({
    client,
    term: 'ToStore',
    outSteps: [storeStepsPath],
    variables: Object.entries(variables),
  })
}

async function startRun({ client, term, outSteps, variables = [] }) {
  const dataset = await $rdf.dataset().import(fromFile(pipelinePath))
  await Promise.all(outSteps.map(src => dataset.import(fromFile(src))))
  const pipeline = clownface({ dataset }).namedNode(term)

  const outputStream = new PassThrough()
  const run = await Runner(pipeline, {
    basePath: __dirname,
    variables: new Map([
      ['client', client],
      ...variables,
    ]),
    outputStream,
  })

  return { stream: outputStream, run }
}
