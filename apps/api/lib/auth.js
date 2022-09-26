import auth from 'basic-auth'
import clownface from 'clownface'
import $rdf from 'rdf-ext'

export function basic() {
  return (req, res, next) => {
    const credentials = auth(req)
    if (!credentials) {
      res.setHeader('WWW-Authenticate', 'Basic Realm="view builder"')
    } else {
      req.agent = clownface({ dataset: $rdf.dataset() })
        .namedNode(req.rdf.namedNode(`/user/${credentials.name}`))
    }

    next()
  }
}
