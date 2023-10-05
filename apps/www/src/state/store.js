import { create, core, resource, operation } from '@hydrofoil/shell'
import * as plugins from './plugins.js'
import { app } from './app/index.js'

export const config = {
  models: {
    app,
    core,
    resource,
    operation,
  },
  plugins,
}

export const store = create(config)
