import fs from 'fs'
import { promisify } from 'util'
import Vue from 'vue'
import _templateFn from 'lodash.template'
import { createRenderer } from 'vue-server-renderer'
import * as compiler from 'vue-template-compiler'
import createApp from './app'
import createHead from './head'

const headRE = /<head([^>]*)>(.*?)<\/head>/msi
const nodesRE = /<([a-z]+)([^>]*)>(.*?)<\/\1>/gmsi

const renderToString = promisify(createRenderer().renderToString)

let _template
function getTemplate() {
  if (_template) {
    return _template
  }

  let template = fs.readFileSync('./index.template.html', 'utf-8')

  let staticChilds = []
  if (template.includes('<head')) {
    let [ outerHTML, headAttributes, headContent ] = template.match(headRE) || []

    if (headContent.includes('<')) {
      let childMatch
      while (childMatch = nodesRE.exec(headContent)) {
        // compile empty child to get attrMap
        const compiledChild = compiler.compile(childMatch[0].replace(childMatch[3], ''))
        const inner = childMatch[3]

        staticChilds.push({
          tag: compiledChild.ast.tag,
          hid: false,
          ...compiledChild.ast.attrsMap,
          inner
        })
      }
    }

    template = template.replace(outerHTML, '{{head}}')
  }

  const compiledTemplate = _templateFn(template, {
    interpolate: /{{([\s\S]+?)}}/g
  })

  _template = { compiledTemplate, staticChilds }
  return _template
}

async function main() {
  const app = createApp()
  const head = createHead()

  const initialHead = app.$options.head()
  
  const { compiledTemplate, staticChilds = [] } = getTemplate()

  /* metaInfo tags are rendered in the following order
   * - dynamic tags
   * - static defined tags in app
   * - static tags from template
   */
  if (initialHead.staticChilds) {
    staticChilds.unshift(...initialHead.staticChilds)
  }

  if (staticChilds) {
    head.staticChilds = staticChilds
  }

  Vue.set(head, 'metaInfo', initialHead)

  const context = {
    head: await renderToString(head),
    app: await renderToString(app)
  }

  const html = compiledTemplate(context)
  fs.writeFileSync('ssr.html', html)
}

main()
