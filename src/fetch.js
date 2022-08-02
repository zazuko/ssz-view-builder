import str2stream from 'string-to-stream'
import { parsers } from '@rdf-esm/formats-common'
import * as RDF from '@rdf-esm/dataset'
import clownface from 'clownface'
import isAbsoluteUrl from 'is-absolute-url'

async function fetch(id, what) {
  const uri = isAbsoluteUrl(id) ? id : `./dist/${what}/${id}.turtle`

  const res = await window.fetch(uri)
  const stream = str2stream(await res.text())

  const parsed = parsers.import('text/turtle', stream)

  const dataset = RDF.dataset()
  // @ts-ignore https://unpkg.com/browse/@rdfjs/types@1.0.1/stream.d.ts
  for await (const quad of parsed) {
    dataset.add(quad)
  }

  const graph = clownface({ dataset })
  return isAbsoluteUrl(id) ? graph.namedNode(id) : graph
}

/**
 * @param id resource URI or path to local shape
 */
export function fetchShapes (id) {
  return fetch(id, 'shapes')
}

/**
 * @param id resource URI or path to local shape
 */
export function fetchResource (id) {
  return fetch(id, 'resource')
}
