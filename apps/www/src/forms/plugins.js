import { addPlugin } from '@hydrofoil/shaperone-core/store.js'
import { autoExpand } from './plugins/autoExpand.js'
import { autoResourceLabel, filterLabel } from './plugins/autoName.js'

addPlugin({
  autoExpand,
  autoResourceLabel,
  filterLabel,
})
