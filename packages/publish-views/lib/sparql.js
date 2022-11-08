import onetime from 'onetime'
import StreamClient from 'sparql-http-client'

export const getViewBuilderClient = onetime(variables => new StreamClient({
  endpointUrl: variables.get('SPARQL_ENDPOINT'),
  user: variables.get('SPARQL_USER'),
  password: variables.get('SPARQL_PASSWORD'),
}))

export const getMetadataClient = onetime(variables => new StreamClient({
  endpointUrl: variables.get('METADATA_ENDPOINT'),
}))
