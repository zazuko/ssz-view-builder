import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js'
import { fetchResource } from './fetch'
import './element/ssz-view-builder.js'

setBasePath('https://unpkg.com/@shoelace-style/shoelace/dist')

const form = document.querySelector('ssz-view-builder')

document.querySelectorAll('sl-menu-item.example').forEach((menuItem) => {
  menuItem.addEventListener('click', async (e) => {
    const example = e.target.value
    const graph = await fetchResource(example)
    form.resource = graph.namedNode('')
  })
})
