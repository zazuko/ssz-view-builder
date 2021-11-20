import str2stream from 'string-to-stream'
import { parsers } from '@rdf-esm/formats-common'
import * as RDF from '@rdf-esm/dataset'
import clownface from 'clownface'

export async function loadShape({
  shape,
  id = ''
}) {
  const res = await fetch(`./dist/shapes/${shape}.ttl`)
  const stream = str2stream(await res.text())

  const parsed = parsers.import('text/turtle', stream)

  const dataset = RDF.dataset()
  // @ts-ignore https://unpkg.com/browse/@rdfjs/types@1.0.1/stream.d.ts
  for await (const quad of parsed) {
    dataset.add(quad)
  }

  return clownface({ dataset }).namedNode(id)
}
