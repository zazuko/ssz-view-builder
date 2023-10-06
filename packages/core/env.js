import { createEnv } from '@rdfine/env'
import { ShFactory } from '@rdfine/shacl/Factory'
import { HydraFactory } from '@rdfine/hydra/Factory'

export default createEnv(
  ShFactory,
  HydraFactory,
)
