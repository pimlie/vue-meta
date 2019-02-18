import Vue from 'vue'
import * as components from './components'

function createHead({ staticChilds } = {}) {
  return new Vue({
    data() {
      return {
        metaInfo: {}
      }
    },
    beforeMount() {
      if (!this.$isServer) {
        // manuall add non-ssr / static head childNodes to prevent hydration errors
        const staticElements = Array.from(this.$el.querySelectorAll(':not([hid])'))
        if (staticElements) {
          const head = document.getElementsByTagName('head')[0]
          this.staticChilds = this.staticChilds || []

          staticElements.forEach(el => {
              if (el.previousSibling && el.previousSibling.nodeType !== 1 && !el.previousSibling.__vm_added) {
                this.staticChilds.push(el.previousSibling.textContent)
              }

              const child = { tag: el.tagName }
              if (el.hasAttributes()) {
                child.attrs = {}
                el.getAttributeNames().forEach(attributeName => {
                  child.attrs[attributeName] = el.getAttribute(attributeName)
                })
              }

              const innerHTML = el.innerHTML
              if (innerHTML) {
                child.domProps = { innerHTML }
              }
              this.staticChilds.push(child)

              if (el.nextSibling && el.nextSibling.nodeType !== 1) {
                el.nextSibling.__vm_added = true
                this.staticChilds.push(el.nextSibling.textContent)
              }
          })
        }
      }
    },
    render(h) {
      const children = []
      for (const type in this.metaInfo) {
        if (type !== 'staticChilds' && components[type]) {
          children.push(h(components[type], {
            props: typeof this.metaInfo[type] === 'object' ? this.metaInfo[type] : { [type]: this.metaInfo[type] }
          }))
        }
      }

      if (this.staticChilds) {
        for (const k in this.staticChilds) {
          const child = this.staticChilds[k]

          if (child.tag) {
            const domProps = child.domProps || {}
            if (child.inner) {
              domProps.innerHTML = child.inner
            }

            const attrs = child.attrs || {
              hid: child.hid || child.hid === false ? child.hid : 'sc',
              ...child
            }

            delete attrs.tag
            delete attrs.inner
            delete attrs.domProps
            children.push(h(child.tag, {
              attrs,
              domProps,
            }))
          } else {
            children.push(child)
          }
        }
      }

      return h('head', {}, children)
    }
  })
}

export default createHead
