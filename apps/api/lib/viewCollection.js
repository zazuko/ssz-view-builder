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
      {
        ${subject} ${schema.name} ${q}
      }
      UNION
      {
        ${subject} ${schema.alternateName} ${q}
      }
      UNION
      {
        ${subject} ${schema.author}/${vcard.hasName} ${q}
      }
  
      FILTER( REGEX(str(${q}), "${object.value}", "i") )
    }
    UNION
    {
      ${subject} ${schema.author}/${vcard.hasUID} "${object.value}"
    }
  `
}

export function construct({ client }) {
  return (...members) => {
    const resources = members.map(resource => ({ resource }))

    // TODO: Construct generated from NodeShape
    return CONSTRUCT`
      ?resource a ?type ;
                ${schema.name} ?name ; 
                ${schema.alternateName} ?alt .
                
      ?resource ${schema.author} ?author . 
      ?author ${vcard.hasName} ?authorName .

      ?resource  <https://ld.stadt-zuerich.ch/schema/metadataCreator> ?metadataCreator . 
      ?metadataCreator ${vcard.hasName} ?authorName .
    `.WHERE`
      ${VALUES(...resources)}

      ?resource a ?type ;
                ${schema.name} ?name ; 
                ${schema.alternateName} ?alt ;

      OPTIONAL {
        ?resource <https://ld.stadt-zuerich.ch/schema/metadataCreator> ?metadataCreator .

        OPTIONAL {
          ?metadataCreator ${vcard.hasName} ?authorName .
        }
      }
                
      OPTIONAL {
        ?resource ${schema.author} ?author .
      
        OPTIONAL {
          ?author ${vcard.hasName} ?authorName .
        }
      }
    `.execute(client.query)
  }
}
