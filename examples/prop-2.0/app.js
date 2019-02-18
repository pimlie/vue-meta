import Vue from 'vue'

function createApp({ __vm_head } = {}) {
  return new Vue({
    head() {
      return {
        staticChilds: [
          { tag: 'link', rel: 'stylesheet', href: '/global.css' }
        ],
        charset: this.charset,
        description: 'Helluuuuuuuw?'
      }
    },
    beforeCreate() {
      if (typeof this.$options.head === 'function') {
        this.$options.computed = this.$options.computed || {}
        this.$options.computed.$head = this.$options.head

        if (__vm_head) {
          this.$options.created = this.$options.created || []
          this.$options.created.push(() => {
            this.$watch('$head', (newVal) => {
              Vue.set(__vm_head, 'metaInfo', newVal)
            })
          })
        }
      }
    },
    props: {
      charset: {
        type: String,
        default: 'utf-8'
      }
    },
    render(h) {
      return h('div', {
        attrs: {
          id: 'app'
        }
      }, [
        h('h1', {}, 'VM2.0 Tryout'),
        h('p', {}, [
          'Inspect Element to see the meta info, try both ',
          h('a', { attrs: { href: '/prop-2.0' } }, 'browser only'),
          ' as ',
          h('a', { attrs: { href: '/prop-2.0/ssr.html' } }, 'ssr'),
        ]),
        h('p', {}, [
          'Regenerate ssr.html by running `node -r esm server.js`'
        ])
      ])
    }
  })
}

export default createApp
