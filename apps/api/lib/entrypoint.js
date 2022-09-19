export function redirect(req, res) {
  res.redirect(req.rdf.namedNode('views').value)
}
