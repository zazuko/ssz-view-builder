import generateDimensionsShapeQuads from '@view-builder/core/shape/ViewWithSource.ttl'
import viewValidationShapeQuads from '@view-builder/core/shape/ViewValidationShape.ttl'
import { prepareViewPointer } from '@view-builder/view-util'
import factory from 'rdf-ext'

const GenerateDimensionsShapes = factory.dataset(generateDimensionsShapeQuads({ factory }))

const ViewValidationShapes = factory.dataset(viewValidationShapeQuads({ factory }))

export default function (store) {
  const dispatch = store.getDispatch().viewForm

  return async () => {
    const { pointer } = store.getState().viewForm
    const view = prepareViewPointer(pointer)

    dispatch.setViewValidity(await validate(view, ViewValidationShapes))
    dispatch.setSourcesValidity(await validate(view, GenerateDimensionsShapes))
  }
}

async function validate(pointer, shapes) {
  const Validator = (await import('rdf-validate-shacl')).default

  return new Validator(shapes).validate(pointer.dataset)
}
