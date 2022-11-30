import sh1 from '@hydrofoil/shaperone-core/ns.js'
import { SELECT } from '@tpluscode/sparql-builder'
import { rdfs, rdf, schema } from '@tpluscode/rdf-ns-builders'
import { isGraphPointer, isLiteral } from 'is-graph-pointer'
import { findNodes, toSparql } from 'clownface-shacl-path'
import { view, viewBuilder } from '@view-builder/core/ns.js'
import { store } from '../../state/store.js'

export const autoResourceLabel = {
  model: {
    effects({ getDispatch }) {
      const { forms } = getDispatch()

      return {
        /**
         * When setting properties annotated with sh1:setFocusNodeLabel,
         * set focus node's rdfs:label from the selected object
         */
        'forms/setObjectValue': async (arg) => {
          const { pointer } = arg.property
          const setFocusNodeLabel = pointer.out(sh1.setFocusNodeLabel)
          const labelPath = pointer.out(sh1.labelPath)

          if (!isGraphPointer(setFocusNodeLabel)) {
            return
          }

          let { focusNode } = arg
          if (!isLiteral(setFocusNodeLabel)) {
            focusNode = findNodes(focusNode, setFocusNodeLabel)
          }

          const label = await loadResourceLabel(arg.newValue, labelPath)
          focusNode.deleteOut(rdfs.label).addOut(rdfs.label, label)
          forms.updateComponentState({ ...arg, newState: { label } })
        },
      }
    },
  },
}

export const filterLabel = {
  model: {
    effects({ getDispatch }) {
      const { forms } = getDispatch()

      return {
        /**
         * When setting properties of view:Filter,
         * set the label based on its representation
         */
        'forms/setObjectValue': async (arg) => {
          const { focusNode, property } = arg
          if (focusNode.has(rdf.type, view.Filter).terms.length === 0) {
            return
          }

          let label = 'Filter'
          const dimension = focusNode
            .out(viewBuilder.baseDimension)
            .out(view.from)
            .out(view.path)
          if (isGraphPointer(dimension)) {
            const filterTermSet = focusNode.out(viewBuilder.filterTermSet)
            const operator = focusNode.out(view.operation)
            const argument = focusNode.out(view.argument)

            if (isGraphPointer(filterTermSet)) {
              const dimensionLabel = await loadResourceLabel(dimension.term, schema.name)
              const termSetLabel = await loadResourceLabel(filterTermSet.term, schema.name)

              label = `${dimensionLabel} is one of "${termSetLabel}"`
            } else if (isGraphPointer(operator) && isGraphPointer(argument)) {
              const dimensionLabel = await loadResourceLabel(dimension.term, schema.name)
              const operatorLabel = property.pointer.node(operator).out(rdfs.label).value

              label = `${dimensionLabel} ${operatorLabel} "${argument.value}"`
            }
          }

          focusNode.deleteOut(rdfs.label).addOut(rdfs.label, label)
          forms.updateComponentState({ ...arg, newState: { label } })
        },
      }
    },
  },
}

async function loadResourceLabel(id, labelPath = rdfs.label) {
  try {
    const propertyPath = isGraphPointer(labelPath)
      ? toSparql(labelPath)
      : labelPath

    const [result] = await SELECT`?label`
      .WHERE`${id} ${propertyPath} ?label`
      .execute(store.state.app.sparqlClient.query)

    return result?.label.value || id.value
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(e)
    return id.value
  }
}
