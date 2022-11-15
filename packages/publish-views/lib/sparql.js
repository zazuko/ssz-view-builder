import StreamClient from 'sparql-http-client'

const ViewBuilderClient = 'ViewBuilderClient'
const MetadataClient = 'MetadataClient'

export const getViewBuilderClient = (variables) => {
  if (!variables.has(ViewBuilderClient)) {
    variables.set(ViewBuilderClient, new StreamClient({
      endpointUrl: variables.get('SPARQL_ENDPOINT'),
      user: variables.get('SPARQL_USER'),
      password: variables.get('SPARQL_PASSWORD'),
    }))
  }

  return variables.get(ViewBuilderClient)
}

export const getMetadataClient = (variables) => {
  if (!variables.has(MetadataClient)) {
    variables.set(MetadataClient, new StreamClient({
      endpointUrl: variables.get('METADATA_ENDPOINT'),
    }))
  }

  return variables.get(MetadataClient)
}
