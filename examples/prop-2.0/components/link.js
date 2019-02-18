import { createId } from './shared'

const uniqueLink = []

let mcid = 0

export default {
  name: 'link-component',
  // functional: true,
  props: {
    hid: String,
    rel: String,
    href: String,
  },
  data: function () {
    return {
      _hid: this.hid,
    }
  },
  beforeMount: function () {
    if (!this.hid) {
      this._hid = `mc-${createId(uniqueLink, this)}`
    }
  },
  render: function (h) {
    return h('link', {
      attrs: {
        ...this.$props,
        hid: this.hid || this._hid || `mcn-${mcid++}`
      }
    })
  }
}
