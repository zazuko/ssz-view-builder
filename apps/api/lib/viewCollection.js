import { CONSTRUCT, sparql } from '@tpluscode/sparql-builder'
import { schema, vcard } from '@tpluscode/rdf-ns-builders'
import { VALUES } from '@tpluscode/sparql-builder/expressions'

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

export function construct({ client }) {
  return (members) => {
    const resources = members.map(resource => ({ resource }))

    // TODO: Construct generated from NodeShape
    return CONSTRUCT`
      ?resource ${schema.identifier} ?id ; 
                ${schema.name} ?name ; 
                ${schema.alternateName} ?alt .
                
      ?resource ${schema.author} ?author . ?author ${vcard.hasUID} ?authorName .
    `.WHERE`
      ${VALUES(...resources)}

      ?resource ${schema.identifier} ?id ; 
                ${schema.name} ?name ; 
                ${schema.alternateName} ?alt .
                
      OPTIONAL {
        ?resource ${schema.author} ?author . ?author ${vcard.hasUID} ?authorName .
      }
    `.execute(client.query)
  }
}
