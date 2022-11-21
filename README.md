# SSZ View Builder

Prototype for UI to build views following the [RDF Data Cube specification][cube] (WIP)

## Running locally

1. Install [lando](https://github.com/lando/lando/releases/latest)
2. `yarn`
3. [Request Stardog license](https://www.stardog.com/download-free/) and save to `~/stardog-home/stardog-license-key.bin`
4. `lando start`
5. `yarn bootstrap` - initialize the required database resources
6. Open [https://view-builder.lndo.site/app/](https://view-builder.lndo.site/app/)

For testing, credentials are stored in the file [creds.json](creds.json)

Any changes to the RDF sources in `apps/api/lib/resource(.dev)` will restart the app container, but it will
also be necessary to run `yarn bootstrap` to update the store.

## API test

Once the local environment is up, some API HTTP tests can be executed by running:

```
lando test-api test/api/**/*.http
```

The glob pattern can be replaced with a concrete path to anny of the test `.http` files in the `test/api` directory.

Tests are executed using [restcli](https://github.com/restcli/restcli).

_API tests are now disabled on CI because we need a way to provide a Stardog license to the workflow_

[cube]: https://github.com/zazuko/cube-link

## Deployment notes

The Stardog database should have:
- the "Query All Graphs" (`query.all.graphs`) option set to `true`,
- the "Describe Strategy" (`query.describe.strategy`) option set to `cbd`.

The [creds.json](creds.json) file is excluded from docker image. When running a container,
make sure to mount a similar file as `/creds.json`.
