import { createRequire } from 'module'
import { Router } from 'express'
import auth from 'express-basic-auth'
import clownface from 'clownface'
import $rdf from 'rdf-ext'
import asyncMiddleware from 'middleware-async'
import { DESCRIBE } from '@tpluscode/sparql-builder'
import { rdf, vcard } from '@tpluscode/rdf-ns-builders'
import { isNamedNode } from 'is-graph-pointer'

const require = createRequire(import.meta.url)

export function basic({ client }) {
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
    .use(setAgent(client))
}

function setAgent(client) {
  return asyncMiddleware(async (req, res, next) => {
    const userName = req.auth?.user

    if (!userName) {
      return next()
    }
    const userQuery = await DESCRIBE`?user`
      .WHERE`?user ${vcard.hasUID} "${userName}"`
      .execute(client.query)
    const dataset = await $rdf.dataset().import(userQuery)

    let [foundUser] = clownface({ dataset })
      .has(vcard.hasUID, userName)
      .toArray()
      .filter(isNamedNode)

    if (foundUser) {
      req.knossos.log(`Current user ${foundUser.value}`)
    } else {
      const id = req.rdf.namedNode(`/user/${encodeURIComponent(userName)}`)
      foundUser = clownface({ dataset: $rdf.dataset() })
        .namedNode(id)
        .addOut(rdf.type, vcard.Individual)
        .addOut(vcard.hasUID, userName)
      await req.knossos.store.save(foundUser)
        .then(() => req.knossos.log(`Created user resource ${foundUser.value}`))
        .catch(req.knossos.log)
    }

    req.agent = foundUser

    return next()
  })
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
