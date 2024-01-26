import Environment from '@zazuko/env/Environment.js'
import RdfineEnv from '@rdfine/env'
import { ShFactory } from '@rdfine/shacl/Factory'
import { HydraFactory } from '@rdfine/hydra/Factory'

export default new Environment([
  ShFactory,
  HydraFactory,
], { parent: RdfineEnv })
