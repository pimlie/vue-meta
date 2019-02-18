import { createId } from './shared'

const uniqueMeta = [
  'charset',
  { name: 'application-name', lang: true },
  { name: 'description' },
  { 'http-equiv': true }
]

let mcid = 0

export default {
  name: 'meta-component',
  // functional: true,
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
      this._hid = `mc-${createId(uniqueMeta, this)}`
    }

    /*const $cmpnt = this.$el ? this : this.$parent
    if ($cmpnt && $cmpnt.$el) {
      for (const prop in this.$props) {
        const propValue = $cmpnt.$el.getAttribute(prop)
        if (propValue) {
          
          $cmpnt[prop === 'hid' ? '_hid' : prop] = propValue
        }
      }
    }*/
  },
  render: function (h) {
    return h('meta', {
      attrs: {
        ...this.$props,
        hid: this.hid || this._hid || `mcn-${mcid++}`
      }
    })
  }
}
