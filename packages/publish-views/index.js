import Runner from 'barnard59/runner.js'
import fromFile from 'rdf-utils-fs/fromFile.js'
import $rdf from 'rdf-ext'
import clownface from 'clownface'
import path from 'path'
import { fileURLToPath } from 'url'
import { PassThrough } from 'stream'

const __dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), 'pipeline')
const pipelinePath = 'main.ttl'
const storeStepsPath = 'to-store.ttl'
const ntriplesStepsPath = 'to-ntriples.ttl'
const fileStepsPath = 'to-file.ttl'
const loadViewsFromStoreStepPath = 'steps/loadViews.ttl'

export function toNtriples({
  outFile,
  variables = {},
  loadViewsStepsPath = loadViewsFromStoreStepPath,
}) {
  return startRun({
    term: 'ToFile',
    steps: [ntriplesStepsPath, fileStepsPath, loadViewsStepsPath],
    variables: {
      outFile,
      ...variables,
    },
  })
}

export async function toStore(variables = {}) {
  return startRun({
    term: 'ToStore',
    steps: [storeStepsPath, loadViewsFromStoreStepPath],
    variables,
  })
}

async function startRun({ term, steps, variables }) {
  const dataset = await $rdf.dataset().import(fromFile(path.resolve(__dirname, pipelinePath)))
  await Promise.all(steps.map(src => dataset.import(fromFile(path.resolve(__dirname, src)))))
  const pipeline = clownface({ dataset }).namedNode(term)

  const outputStream = new PassThrough()
  const run = await Runner(pipeline, {
    basePath: __dirname,
    variables: new Map(Object.entries(variables)),
    outputStream,
    level: 'debug',
  })

  return { stream: outputStream, run }
}
