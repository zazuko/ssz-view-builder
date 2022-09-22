#!/bin/sh

set +x

/app/server.js \
  --config=/config-sparql.json \
  --sparql-endpoint-url="http://$SPARQL_USER:$SPARQL_PASSWORD@store:5820/view-builder/query"
