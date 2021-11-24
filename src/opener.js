import { turtle } from '@tpluscode/rdf-string'

let tab

document.querySelector('button').addEventListener('click', () => {
  const form = document.querySelector('shaperone-form')
  tab?.close()

  tab = window.open(`about:blank`, 'shaperone')
  const resourceTurtle = `<pre>${turtle`${form.resource.dataset}`.toString().replace(/</g, '&lt;')}</pre>`

  tab.document.write(`
    <head><title>Shaperone resource</title></head>
    <iframe style="border: none; width: 100vw; height: 100vh;" 
      src="data:text/html,${encodeURIComponent(resourceTurtle)}">
    </iframe>
  `)
})