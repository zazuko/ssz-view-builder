import { turtle } from '@tpluscode/rdf-string'
import namespace from '@rdfjs/namespace'
import $rdf from 'rdf-ext'
import toStream from 'string-to-stream'
import clownface from 'clownface'
import { StreamParser } from 'n3'

export const ex = namespace('http://example.com/')

export async function testData(strings, ...values) {
  const turtleStream = toStream(turtle(strings, ...values).toString())
  const quadStream = turtleStream.pipe(new StreamParser())
  const dataset = await $rdf.dataset().import(quadStream)

  return clownface({ dataset }).namedNode('')
}
