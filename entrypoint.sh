#!/bin/sh

set -eu

echo "Preparing environment resources"
find apps/api/resources.live -name '*.ttl' -exec /bin/sh -c 'envsubst < $1 > $1.tmp && mv $1.tmp $1' -- {} \;

echo "Starting the production app…"
yarn run prod
