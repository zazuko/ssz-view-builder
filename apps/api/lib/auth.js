import { createRequire } from 'module'
import { Router } from 'express'
import auth from 'express-basic-auth'
import clownface from 'clownface'
import $rdf from 'rdf-ext'

const require = createRequire(import.meta.url)

export function basic() {
  const authMiddleware = auth({
    users: loadUsers(),
    challenge: true,
    realm: 'view builder',
  })

  return Router()
    .use((req, res, next) => {
      if (req.path === '/api/health') {
        // Skip authentication for ping endpoint
        return next()
      }

      return authMiddleware(req, res, next)
    })
    .use(setAgent)
}

function setAgent(req, res, next) {
  if (req.auth?.user) {
    req.agent = clownface({ dataset: $rdf.dataset() })
      .namedNode(req.rdf.namedNode(`/user/${req.auth.user}`))
  }

  next()
}

function loadUsers() {
  try {
    // eslint-disable-next-line import/no-unresolved
    return require('../../../creds.json')
  } catch (e) {
    /* eslint-disable no-console */
    console.warn('Failed to load credentials')
    console.warn(e)
    return []
  }
}
