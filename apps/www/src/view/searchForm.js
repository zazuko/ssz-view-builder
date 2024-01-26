import $rdf from '@view-builder/core/env.js'
import { hyper_query as query } from '@hydrofoil/vocabularies/builders'
import { html } from 'lit'

export function searchForm(pointer) {
  const collection = $rdf.rdfine.hydra.Collection(pointer)
  const template = collection.search
  const shape = template.get($rdf.ns.dash.shape, { strict: false })
  const currentFilters = collection.get(query.templateMappings, { strict: false })

  if (shape) {
    return html`<shaperone-form .shapes="${shape.pointer}" 
                                .resource="${currentFilters.pointer}"
                                @changed="${doFilter(template)}"></shaperone-form>`
  }

  return ''
}

function doFilter(template) {
  return (e) => {
    if (!searchHasMinLength(template, e.detail.focusNode)) {
      return
    }

    const resource = template.expand(e.detail.focusNode)

    e.target.dispatchEvent(new CustomEvent('show-resource', {
      bubbles: true,
      composed: true,
      detail: {
        resource,
      },
    }))
  }
}

function searchHasMinLength(template, ptr) {
  const { value } = ptr.out($rdf.ns.hydra.freetextQuery)
  if (value === '') {
    return true
  }

  const mapping = template.mapping
    .find(({ property }) => property.id.equals($rdf.ns.hydra.freetextQuery))
  const minLength = mapping?.getNumber($rdf.ns.sh.minLength)

  return minLength && minLength <= value.length
}
