import str2stream from 'string-to-stream'
import formats from '@rdfjs/formats-common'
import * as RDF from '@rdf-esm/dataset'
import clownface from 'clownface'
import type {DatasetCore} from '@rdfjs/types'

export async function loadShape({ shape, id = '' }) {
  const res = await fetch(`./dist/shapes/${shape}.ttl`)
  const stream = str2stream(await res.text())

  const parsed = formats.parsers.import('text/turtle', stream)

  const dataset = await new Promise<DatasetCore>(res => {
    const dataset = RDF.dataset()
    parsed.on('data', quad => {
      dataset.add(quad)
    })
    parsed.on('end', () => {
      res(dataset);
    })
  })

  return clownface({ dataset }).namedNode(id)
}
