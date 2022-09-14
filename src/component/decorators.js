import { dash, rdf, rdfs } from '@tpluscode/rdf-ns-builders'
import { SELECT } from '@tpluscode/sparql-builder'
import { isGraphPointer, isNamedNode } from 'is-graph-pointer'
import { findNodes, toSparql } from 'clownface-shacl-path'
import sh1 from '@hydrofoil/shaperone-core/ns.js'
import { client } from '../queries/index.js'

export const dataGraphInstanceSource = {
  applicableTo(component) {
    return component.editor.equals(dash.InstancesSelectEditor)
  },
  decorate(component) {
    return {
      ...component,
      loadChoices(args, freetextQuery) {
        const { focusNode, property } = args
        const { class: clas } = property.shape
        if (!clas) {
          return component.loadChoices(args, freetextQuery)
        }

        return focusNode
          .any()
          .has(rdf.type, clas.id)
          .toArray()
      },
    }
  },
}

const autoNameDecorated = 'autoNameDecorated'

export const autoName = {
  applicableTo(component) {
    return component.editor.equals(dash.TextFieldEditor)
  },
  decorate(component) {
    return {
      ...component,
      async getLabel(id, labelPath) {
        const propertyPath = isGraphPointer(labelPath)
          ? toSparql(labelPath)
          : rdfs.label

        try {
          const [result] = await SELECT`?label`
            .WHERE`${id.term} ${propertyPath} ?label`
            .execute(client.query)

          return result?.label.value || id.value
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn(e)
          return id.value
        }
      },
      async init(params, actions) {
        const { value, focusNode, updateComponentState, property } = params

        const sourcePath = property.shape.pointer.out(sh1.valueFrom)
        if (isGraphPointer(sourcePath)) {
          const previous = value.componentState.valueFrom
          let { edited } = value.componentState
          const current = findNodes(focusNode, sourcePath)

          if (typeof edited === 'undefined') {
            edited = !isEmpty(value.object?.value)
          }

          if (!edited && isGraphPointer(current) && !current.term.equals(previous)) {
            updateComponentState({
              valueFrom: current.term,
            })

            let label = current.value

            if (isNamedNode(current)) {
              const labelPath = property.shape.pointer.out(sh1.labelPath)

              label = await this.getLabel(current, labelPath)
            }

            actions.update(label)
          }

          updateComponentState({
            edited,
            [autoNameDecorated]: true,
          })
        }

        return component.init?.(params, actions) || true
      },
      _decorateRender(render) {
        return (params, actions) => {
          const { value, updateComponentState } = params

          if (value.componentState[autoNameDecorated]) {
            return render(params, {
              ...actions,
              update(value) {
                updateComponentState({
                  edited: !isEmpty(value),
                })
                actions.update(value)
              },
            })
          }

          return render(params, actions)
        }
      },
    }
  },
}

function isEmpty(arg) {
  return arg === '' || !arg || arg.value === ''
}
