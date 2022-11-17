import { URL } from 'url'
import { readFile } from 'fs/promises'

export async function load(url, context, defaultLoad) {
  if (url.endsWith('.rq')) {
    const content = await readFile(new URL(url))

    return {
      format: 'module',
      source: `export default \`${content.toString()}\`;`,
    }
  }

  return defaultLoad(url, context, defaultLoad)
}
