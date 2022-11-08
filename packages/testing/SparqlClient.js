import BaseClient from 'sparql-http-client/BaseClient.js'
import RawQuery from 'sparql-http-client/RawQuery.js'
import StreamStore from 'sparql-http-client/StreamStore.js'
import sinon from 'sinon'

export default class extends BaseClient {
  constructor() {
    super({})

    this.query = sinon.createStubInstance(RawQuery)
    this.store = sinon.createStubInstance(StreamStore)
  }
}
