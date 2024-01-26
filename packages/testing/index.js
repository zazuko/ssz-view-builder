import { turtle } from '@tpluscode/rdf-string'
import $rdf from '@zazuko/env'
import toStream from 'string-to-stream'
import { StreamParser } from 'n3'

export const ex = $rdf.namespace('http://example.com/')
export const ssz = $rdf.namespace('https://ld.stadt-zuerich.ch/statistics/')

export async function testData(strings, ...values) {
  const turtleStream = toStream(turtle(strings, ...values).toString())
  const quadStream = turtleStream.pipe(new StreamParser())
  const dataset = await $rdf.dataset().import(quadStream)

  return $rdf.clownface({ dataset }).namedNode('')
}
