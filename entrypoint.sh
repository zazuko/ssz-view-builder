#!/bin/sh

set -eu

echo "Runing preprod script…"
yarn run preprod

echo "Starting the production app…"
yarn run prod
