import { CONSTRUCT, sparql } from '@tpluscode/sparql-builder'
import { schema, vcard } from '@tpluscode/rdf-ns-builders'
import { IN } from '@tpluscode/sparql-builder/expressions'
import { ssz } from '@view-builder/core/ns.js'

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
  // TODO: Construct generated from NodeShape
  return (...members) => CONSTRUCT`
      ?resource a ?type ;
                ${schema.name} ?name ; 
                ${schema.alternateName} ?alt .
                
      ?resource ${schema.author} ?author . 
      ?author ${vcard.hasName} ?authorName .

      ?resource  ${ssz.metadataCreator} ?metadataCreator . 
      ?metadataCreator ${vcard.hasName} ?metadataCreatorName .
    `.WHERE`
      FILTER ( ?resource ${IN(...members)} )

      ?resource a ?type ;
                ${schema.name} ?name ; 
                ${schema.alternateName} ?alt ;

      OPTIONAL {
        ?resource ${ssz.metadataCreator} ?metadataCreator .

        OPTIONAL {
          ?metadataCreator ${vcard.hasName} ?metadataCreatorName .
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
