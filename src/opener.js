import { turtle } from '@tpluscode/rdf-string'
import { endpoint } from './queries/index.js'

document.getElementById('converter-opener').addEventListener('click', async () => {
  const { prepareViewPointer } = await import( './view.js')

  const form = document.querySelector('shaperone-form')
  const view = prepareViewPointer(form.resource.dataset)

  const resourceTurtle = turtle`${view.dataset}`.toString()
  const converterUrl = `https://converter.zazuko.com/#value=${encodeURIComponent(resourceTurtle)}&format=text%2Fturtle`
  window.open(converterUrl, 'converter')
})

document.getElementById('yasgui-opener').addEventListener('click', async () => {
  const { prepareViewPointer, createViewQuery } = await import( './view.js')

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

document.getElementById('cube-viewer-opener').addEventListener('click', async () => {
  const { prepareViewPointer } = await import( './view.js')

  const form = document.querySelector('shaperone-form')
  const view = prepareViewPointer(form.resource.dataset)
  const resourceTurtle = turtle`${view.dataset}`.toString()

  const endpointUrl = encodeURIComponent('https://ld.stadt-zuerich.ch/query')
  const cubeViewerUrl = `https://cubeviewerdemo.netlify.app/?endpointUrl=${endpointUrl}&view=${resourceTurtle}`

  window.open(cubeViewerUrl, 'cubeViewer')
})
