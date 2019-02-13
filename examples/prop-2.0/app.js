import Vue from 'vue'

import { isString } from '../../src/shared/typeof'

const uniqueMeta = [
  'charset',
  { name: 'application-name', lang: true },
  { name: 'description' },
  { 'http-equiv': true }
]

function createId(data) {
  let isU
  for (const i in uniqueMeta) {
    const conf = uniqueMeta[i]

    const isS = isString(conf)
    if (isS && data[conf]) {
      return conf
    } else if (!isS) {
      isU = true
      let hid = ''
      for (const k in conf) {
        if (!data[k] || !(conf[k] === true || conf[k] === data[k])) {
          isU = false
          break
        } else {
          hid = `${hid}-${conf[k] === true ? k : data[k]}`
        }
      }

      if (isU) {
        return hid.substr(1)
      }
    }
  }

  return null
}

let mcid = 0
const MetaComponent = Vue.extend({
  name: 'meta-component',
  props: {
    hid: String,
    charset: String,
    name: String,
    httpEquiv: String,
    itemprop: String,
    lang: String,
    content: String
  },
  data: function () {
    return {
      _hid: this.hid,
    }
  },
  beforeMount: function () {
    if (!this.hid) {
      this._hid = `mc-${createId(this)}`
    }

    const $cmpnt = this.$el ? this : this.$parent
    if ($cmpnt && $cmpnt.$el) {
      for (const prop in this.$props) {
        const propValue = $cmpnt.$el.getAttribute(prop)
        if (propValue) {
          
          $cmpnt[prop === 'hid' ? '_hid' : prop] = propValue
        }
      }
    }
  },
  render: function (h) {
    return h('meta', {
      attrs: {
        ...this.$props,
        hid: this.hid || this._hid || `mcn-${mcid++}`
      }
    })
  }
})

Vue.component('meta-component', MetaComponent)

const charsetMeta = new Vue({
  data: {
    charset: 'utf-8'
  },
  render(h) {
    return h('meta-component', {
      props: { ...this.$data }
    })
  }
})

const descriptionMeta = new Vue({
  data: {
    description: 'Hellluuuuww?'
  },
  render(h) {
    return h('meta-component', {
      props: { 
        name: 'description',
        content: this.description
      }
    })
  }
})

const head = document.getElementsByTagName('head')[0]

let el, $el
el = document.querySelector('[hid="mc-charset"]')
$el = charsetMeta.$mount(el).$el
if (!el) head.appendChild($el)

el = document.querySelector('[hid="mc-description"]')
$el = descriptionMeta.$mount(el).$el
if (!el) head.appendChild($el)

let mc
document.querySelectorAll('[hid^="mcn-"]').forEach(el => {
  mc = new MetaComponent()
  mc.$mount(el)
})

setTimeout(() => {
  charsetMeta.charset = 'utf-16'
  descriptionMeta.description = 'Whaaaaaaaaaaaaaaaaaaaaaaaaaaaat?'
  mc.content = 'Its a me, Mario!'
}, 3000)
