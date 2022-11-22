import generateDimensionsShapeQuads from '@view-builder/core/shape/ViewWithSource.ttl'
import viewValidationShapeQuads from '@view-builder/core/shape/ViewValidationShape.ttl'
import { prepareViewPointer } from '@view-builder/view-util'
import $rdf from 'rdf-ext'

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

    dispatch.setViewValidity(await validate(view, ViewValidationShapes))
    dispatch.setSourcesValidity(await validate(view, GenerateDimensionsShapes))
  }
}

async function validate(pointer, shapes) {
  const Validator = (await import('rdf-validate-shacl')).default

  return new Validator(shapes).validate(pointer.dataset)
}
