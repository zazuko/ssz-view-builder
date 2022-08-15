import { turtle } from '@tpluscode/rdf-string'
import { prepareViewPointer, createViewQuery } from './view.js'
import { endpoint } from './queries/index.js'

document.getElementById('converter-opener').addEventListener('click', () => {
  const form = document.querySelector('shaperone-form')
  const view = prepareViewPointer(form.resource.dataset)

  const resourceTurtle = turtle`${view.dataset}`.toString()
  const converterUrl = `https://converter.zazuko.com/#value=${encodeURIComponent(resourceTurtle)}&format=text%2Fturtle`
  window.open(converterUrl, 'converter')
})

document.getElementById('yasgui-opener').addEventListener('click', () => {
  const form = document.querySelector('shaperone-form')
  const view = prepareViewPointer(form.resource.dataset)
  const query = createViewQuery(view)

  const params = new URLSearchParams({
    endpoint,
    query,
    format: 'text/turtle'
  })

  const converterUrl = new URL('https://ld.stadt-zuerich.ch/sparql/')
  converterUrl.hash = params.toString()
  window.open(converterUrl.toString(), 'yasgui')
})
