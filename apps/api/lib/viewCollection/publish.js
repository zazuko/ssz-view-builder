import * as publishViews from '@view-builder/publish-views'
import asyncMiddleware from 'middleware-async'
import { viewBuilder } from '@view-builder/core/ns.js'
import { DELETE } from '@tpluscode/sparql-builder'
import { schema } from '@tpluscode/rdf-ns-builders'
import { toRdf } from 'rdf-literal'
import { temporaryFileTask } from 'tempy'

const {
  PUBLIC_ENDPOINT,
  PUBLIC_STORE_ENDPOINT,
  PUBLIC_ENDPOINT_USER,
  PUBLIC_ENDPOINT_PASSWORD,
  PUBLIC_VIEWS_GRAPH,
  METADATA_ENDPOINT,
  SPARQL_ENDPOINT,
  SPARQL_USER,
  SPARQL_PASSWORD,
} = process.env

const processVariables = {
  PUBLIC_ENDPOINT,
  PUBLIC_STORE_ENDPOINT,
  PUBLIC_ENDPOINT_USER,
  PUBLIC_ENDPOINT_PASSWORD,
  PUBLIC_VIEWS_GRAPH,
  METADATA_ENDPOINT,
  SPARQL_ENDPOINT,
  SPARQL_USER,
  SPARQL_PASSWORD,
}

export default asyncMiddleware(async (req, res, next) => {
  const payload = await req.resource()
  const ignoreWarnings = payload.out(viewBuilder.ignoreWarnings).value === 'true'
  if (payload.out(viewBuilder.downloadOnly).value === 'false') {
    await publish(req, res, next, ignoreWarnings)
  } else {
    downloadViews(req, res, next, ignoreWarnings)
  }
})

function downloadViews(req, res, next, ignoreWarnings) {
  temporaryFileTask(async (temporaryPath) => {
    const { run } = await publishViews.toNtriples(
      {
        outFile: temporaryPath,
        variables: {
          ...processVariables,
          ignoreWarnings,
        },
      },
    )

    await run.finished
      .then(async () => new Promise((resolve) => {
        res.setHeader('Content-type', 'text/plain')
        res.setHeader('Content-Disposition', 'attachment; filename=views.nt')
        res.sendFile(temporaryPath)
        res.on('finish', resolve)
      }))
      .catch(next)
  })
}

async function publish(req, res, next, ignoreWarnings) {
  const { run } = await publishViews.toStore({
    ...processVariables,
    ignoreWarnings,
  })

  run.finished
    .then(() => {
      res.event({
        types: [viewBuilder.ViewsPublished],
        object: req.hydra.term,
      })
      res.sendStatus(204)
    })
    .catch(next)
}

export async function setPublishedDate({ req, event }) {
  const object = event.object.pointer.term

  await DELETE`
    graph ${object} {
      ${object} ${schema.datePublished} ?previous
    }
  `.INSERT`
    graph ${object} {
      ${object} ${schema.datePublished} ${toRdf(new Date())}
    }
  `.WHERE`
    OPTIONAL {
      graph ${object} {
        ${object} ${schema.datePublished} ?previous
      }
    }
  `.execute(req.labyrinth.sparql.query)
}
