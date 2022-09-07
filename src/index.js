import { fetchResource } from './fetch'
import './config'
import './element/ssz-view-builder.js'

const form = document.querySelector('ssz-view-builder')

document.querySelectorAll('sl-menu-item.example').forEach(menuItem => {
  menuItem.addEventListener('click', async (e) => {
    const example = e.target.value
    const graph = await fetchResource(example)
    form.resource = graph.namedNode('')
  })
})
 