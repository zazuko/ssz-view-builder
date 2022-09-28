import { sparql } from '@tpluscode/sparql-builder'
import { schema, vcard } from '@tpluscode/rdf-ns-builders'

export function textFilter({ subject, object, variable }) {
  if (!object.value) {
    return ''
  }

  const q = variable('q')

  return sparql`
    {
      ${subject} ${schema.name} ${q}
    }
    UNION
    {
      ${subject} ${schema.alternateName} ${q}
    }
    UNION
    {
      ${subject} ${schema.author}/${vcard.hasUID} ${q}
    }
  
    FILTER( REGEX(str(${q}), "${object.value}", "i") )
  `
}
