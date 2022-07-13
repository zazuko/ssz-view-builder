import { html } from 'lit'
import { repeat } from 'lit/directives/repeat.js'

export default function ({ property, value }, { update, clear }) {
  const choices = value.componentState.instances || []

  function onInput(e) {
    const { selectedIndex } = e.target
    return selectedIndex === 0
      ? clear()
      : update(choices[(e.target).selectedIndex - 1]?.[0].term)
  }

  return html`<select @input="${onInput}">
        <option value=""></option>
        ${repeat(choices, ([choice, label]) => html`<option ?selected="${choice.term.equals(value.object?.term)}" value="${choice.value}">
            ${label}
        </option>`)}
    </select>`
}