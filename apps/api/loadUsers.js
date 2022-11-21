/* eslint-disable no-console */
import { INSERT, sparql } from '@tpluscode/sparql-builder'
import { vcard } from '@tpluscode/rdf-ns-builders'
import $rdf from 'rdf-ext'
import StreamClient from 'sparql-http-client'
import { loadUsers } from './lib/auth.js'

const client = new StreamClient({
  updateUrl: process.env.SPARQL_UPDATE_ENDPOINT,
  user: process.env.SPARQL_USER,
  password: process.env.SPARQL_PASSWORD,
});

(async function populateUsers() {
  const users = loadUsers()

  const query = users.reduce((previous, [id, { name }]) => {
    const userId = $rdf.namedNode(`${process.env.BASE}/user/${id}`)

    return sparql`${previous}
      
      DROP SILENT GRAPH ${userId};
      ${INSERT.DATA`
        GRAPH ${userId} {
          ${userId} a ${vcard.Individual} ; ${vcard.hasUID} "${id}" ; ${vcard.hasName} "${name || id}" .
        }`};`
  }, sparql``)

  await client.query.update(query.toString())
})().catch(console.error)
