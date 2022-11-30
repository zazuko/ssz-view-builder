#!/bin/sh

set -eu

echo "Preparing environment"
API_VERSION=$(jq -r .version apps/api/package.json)
UI_VERSION=$(jq -r .version apps/www/package.json)

export API_VERSION
export UI_VERSION

echo "Preparing environment resources"
find apps/api/resources.live -name '*.ttl' -exec /bin/sh -c 'envsubst < $1 > $1.tmp && mv $1.tmp $1' -- {} \;

echo "Starting the production app…"
yarn run prod
