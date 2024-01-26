import generateDimensionsShapeQuads from '@view-builder/core/shape/ViewWithSource.ttl'
import viewValidationShapeQuads from '@view-builder/core/shape/ViewValidationShape.ttl'
import { prepareViewPointer } from '@view-builder/view-util'
import $rdf from '@zazuko/env'

const GenerateDimensionsShapes = $rdf.dataset(generateDimensionsShapeQuads($rdf))

const ViewValidationShapes = $rdf.dataset(viewValidationShapeQuads($rdf))

export default function (store) {
  const dispatch = store.getDispatch().viewForm

  return async () => {
    const client = store.getState().app.sparqlClient
    const { pointer } = store.getState().viewForm
    if (!pointer) {
      dispatch.setViewValidity({})
      dispatch.setSourcesValidity({})
      return
    }

    const view = await prepareViewPointer(pointer, { cleanup: false, client })

    dispatch.validateView({ pointer: view, shapes: ViewValidationShapes })
    dispatch.validateSources({ pointer: view, shapes: GenerateDimensionsShapes })
  }
}
