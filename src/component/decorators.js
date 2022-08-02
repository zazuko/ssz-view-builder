import { dash, rdf, rdfs, schema } from '@tpluscode/rdf-ns-builders'
import { isGraphPointer, isNamedNode } from 'is-graph-pointer'
import { findNodes } from 'clownface-shacl-path'
import { sh1 } from '../ns.js'
import { fetch } from '../fetch.js'

export const dataGraphInstanceSource = {
  applicableTo(component) {
    return component.editor.equals(dash.InstancesSelectEditor)
  },
  decorate(component) {
    return {
      ...component,
      async loadChoices(args, freetextQuery) {
        const { focusNode, property } = args
        const { class: clas } = property.shape
        if (!clas) {
          const choices = await component.loadChoices(args, freetextQuery)
          return choices
        }

        return focusNode
          .any()
          .has(rdf.type, clas.id)
          .toArray()
      }
    }
  }
}

const autoNameDecorated = 'autoNameDecorated'

export const autoName = {
  applicableTo(component) {
    return component.editor.equals(dash.TextFieldEditor)
  },
  decorate(component) {
    return {
      ...component,
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
              valueFrom: current.term
            })

            let label = current.value

            if (isNamedNode(current)) {
              const resource = await fetch(current.value)
              let labelPath = property.shape.pointer.out(sh1.labelPath)
              if (!isGraphPointer(labelPath)) {
                labelPath = rdfs.label
              }

              label = findNodes(resource, labelPath).value
            }

            actions.update(label || current.value)
          }

          updateComponentState({
            edited,
            [autoNameDecorated]: true
          })
        } 
        
        return component.init?.(params, actions) || true
      },
      _decorateRender (render) {
        return (params, actions) => {
          const { value, updateComponentState } = params

          if (value.componentState[autoNameDecorated]) {
            return render(params, {
              ...actions,
              update(value) {
                updateComponentState({
                  edited: !isEmpty(value)
                })
                actions.update(value)
              }
            })
          }

          return render(params, actions)
        }
      }
    }
  }
}

function isEmpty(arg) {
  return arg === '' || !arg || arg.value === ''
}
