import { turtle } from '@tpluscode/rdf-string'

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

  const converterUrl = `https://ld.stadt-zuerich.ch/sparql/#query=${encodeURIComponent(query)}&format=text%2Fturtle`
  window.open(converterUrl, 'yasgiu')
})
