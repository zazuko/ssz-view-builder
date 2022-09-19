# SSZ View Builder

Prototype for UI to build views following the [RDF Data Cube specification][cube] (WIP)

## Running locally

1. Install [lando](https://github.com/lando/lando/releases/latest)
2. `yarn`
3. `lando start`
4. `yarn bootstrap` - initialize the required database resources
5. Open [https://view-builder.lndo.site/app/](https://view-builder.lndo.site/app/)

Authentication is just a mockup. Type anything in the browser user/password dialog.

Any changes to the RDF sources in `apps/api/lib/resource(.dev)` will restart the app container, but it will
also be necessary to run `yarn bootstrap` to update the store.

## API test

Once the local environment is up, some API HTTP tests can be executed by running:

```
lando test-api test/api/**/*.http
```

The glob pattern can be replaced with a concrete path to anny of the test `.http` files in the `test/api` directory.

Tests are executed using [restcli](https://github.com/restcli/restcli).

_API tests are now disabled on CI because the containers refuse to start for some reason_

[cube]: https://github.com/zazuko/cube-link
