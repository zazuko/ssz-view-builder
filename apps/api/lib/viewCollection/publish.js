import * as publishViews from '@view-builder/publish-views'
import asyncMiddleware from 'middleware-async'
import { viewBuilder } from '@view-builder/core/ns.js'

export default asyncMiddleware(async (req, res, next) => {
  const payload = await req.resource()
  if (payload.out(viewBuilder.downloadOnly).value === 'false') {
    await publish(req, res, next)
  } else {
    await downloadViews(req, res, next)
  }
})

async function downloadViews(req, res) {
  const { stream } = await publishViews.toNtriples(req.labyrinth.sparql)

  res.setHeader('Content-type', 'text/plain')
  res.setHeader('Content-Disposition', 'attachment; filename=views.nt')

  stream.pipe(res)
}

async function publish(req, res, next) {
  const {
    PUBLIC_ENDPOINT,
    PUBLIC_UPDATE_ENDPOINT,
    PUBLIC_ENDPOINT_USER,
    PUBLIC_ENDPOINT_PASSWORD,
    PUBLIC_VIEWS_GRAPH,
  } = process.env
  const { run } = await publishViews.toStore(req.labyrinth.sparql, {
    PUBLIC_ENDPOINT,
    PUBLIC_UPDATE_ENDPOINT,
    PUBLIC_ENDPOINT_USER,
    PUBLIC_ENDPOINT_PASSWORD,
    PUBLIC_VIEWS_GRAPH,
  })

  run.finished
    .then(() => res.sendStatus(204))
    .catch(next)
}
