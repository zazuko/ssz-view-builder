import { turtle } from '@tpluscode/rdf-string'

document.querySelector('button').addEventListener('click', () => {
  const form = document.querySelector('shaperone-form')

  const resourceTurtle = turtle`${form.resource.dataset}`.toString()
  const converterUrl = `https://converter.zazuko.com/#value=${encodeURIComponent(resourceTurtle)}&format=text%2Fturtle`
  window.open(converterUrl, 'shaperone')
})
