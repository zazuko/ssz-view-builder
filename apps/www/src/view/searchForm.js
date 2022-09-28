import { fromPointer } from '@rdfine/hydra/lib/Collection'
import { dash } from '@tpluscode/rdf-ns-builders'
import { hyper_query as query } from '@hydrofoil/vocabularies/builders'
import { html } from 'lit'

export function searchForm(pointer) {
  const collection = fromPointer(pointer)
  const template = collection.search
  const shape = template.get(dash.shape, { strict: false })
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
    const resource = template.expand(e.detail.focusNode)

    return e.target.dispatchEvent(new CustomEvent('show-resource', {
      bubbles: true,
      composed: true,
      detail: {
        resource,
      },
    }))
  }
}
