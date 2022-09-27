import { view, viewBuilder } from '@view-builder/core/ns.js'
import { rdf, schema } from '@tpluscode/rdf-ns-builders'

export function generateLookupSources(filter) {
  filter
    .deleteOut(view.operation)
    .addOut(view.operation, view.Eq)

  filter
    .deleteOut(view.argument)
    .deleteList(view.argument)
    .addOut(view.argument, filter.out(viewBuilder.filterTermSet))

  filter.addOut(view.dimension, (dimension) => {
    dimension.addOut(view.as, schema.inDefinedTermSet)
    dimension.addOut(view.from, (from) => {
      from.addOut(view.source, (source) => {
        source.addOut(rdf.type, view.LookupSource)
      })
      from.addOut(view.path, schema.inDefinedTermSet)
      from.addOut(view.join, filter.out(viewBuilder.baseDimension))
    })
  })
}

export function createFilterDimension(filter) {
  filter.addOut(view.dimension, (dimension) => {
    const baseDimension = filter.out(viewBuilder.baseDimension)
    const deepPath = filter.out(viewBuilder.drillDownProperty).term
    const basePath = baseDimension.out(view.from).out(view.path).term

    dimension
      .addOut(rdf.type, view.Dimension)
      .addOut(view.from, (from) => {
        from.addOut(view.source, baseDimension.out(view.from).out(view.source))

        if (deepPath) {
          from.addList(view.path, [basePath, deepPath])
        } else {
          from.addOut(view.path, basePath)
        }
      })
  })
}
