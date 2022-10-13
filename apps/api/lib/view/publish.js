import { publish } from '@view-builder/publish-pipeline'
import asyncMiddleware from 'middleware-async'
import { turtle } from '@rdfjs-elements/formats-pretty/serializers'

export default asyncMiddleware(async (req, res) => {
  const stream = await publish(req.labyrinth.sparql)
  const sink = await turtle()

  res.setHeader('Content-Disposition', 'attachment; filename=views.ttl;')

  const ttlStream = await sink.import(stream)
  ttlStream.pipe(res)
})
