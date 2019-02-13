import Vue from 'vue'
import { isFunction, isObject } from '../../src/shared/typeof'
/*import { hooks as hooksMixin, withHooks, useData, useState } from './vue-hooks'

Vue.use(hooksMixin)*/

import parent from './parent.vue'
import child1 from './child-1.vue'
import child2 from './child-2.vue'
import grandChild1 from './grand-child-1.vue'

Vue.component('grand-child1', grandChild1)
Vue.component('child1', child1)
Vue.component('child2', child2)

const _metaInfo = Vue.observable({})

const getSet = (obj, key, value, setter) => {
  const internalKey = `_${key}`

  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get() {
      return this[internalKey]
    },
    set(val) {
      if (isObject(val)) {
        // if the value is an object itself, make it an observable as well (if it doesnt exist)
        if (!this[internalKey]) {
          this[internalKey] = Vue.observable({})
        }

        for (const k in val) {
          if (isObject(val[k])) {
            getSet(this[internalKey], k, setter)
          } else {
            setter(this[internalKey], k, val[k])
          }
        }
      } else {
        setter(this, internalKey, val)
      }
    }
  })

  /* Above only defines the property on the object, now we set the value
   * so the setter is triggered for the value
   */
  obj[key] = value
}

const createMetaInfoProxy = (obj, key, setter) => {
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get() {
      return _metaInfo
    },
    set(val) {
      if (val && isObject(val)) {
        /* _metaInfo is already an observable (see above)
         * set the children recursively
         */
        for (const k in val) {
          getSet(_metaInfo, k, val[k], setter)
        }
      }
    }
  })
}

Vue.mixin({
  beforeCreate() {
    /* move the original metaInfo to a private key
     * and make it a computer prop if its a function
     */
    if (isFunction(this.$options.metaInfo)) {
      this.$options.computed = this.$options.computed || {}
      this.$options.computed._metaInfo = this.$options.metaInfo
    } else {
      this.$options._metaInfo = this.$options.metaInfo
    }

    // local temporary copy
    let metaInfo = this.$options.metaInfo

    this.$options.created = []
    this.$options.created.push(() => {
      // set the temporary copy now the proxy is available
      if(isFunction(metaInfo)) {
        metaInfo = metaInfo.call(this)
      }
      this.$options.metaInfo = metaInfo
      metaInfo = undefined

      // add a watcher on the original metaInfo, if the user
      // updates the metaInfo in their component this will catch it
      this.$watch('_metaInfo', function(newMetaInfo) {
        this.$options.metaInfo = newMetaInfo
      })
    })

    // calculate depth of current component
    let depth = 0
    let p = this
    do {
      p = p.$parent
    } while (p && ++depth)
    this.depth = depth

    /* the setter which determines whether the metaInfo key will be 
     * really updated
     */
    const updateMetaInfo = (obj, key, value) => {
      const metaKey = `_meta_${key}`

      /* this makes it possible to implement different strategies
       * eg deepest (currently), last, first, fn(), etc
       * as we have full access to component tree here
       * 
       * if the strategy returns false we just ignore the update but we should probably
       * keep references to those componets for when the current component is removed
       */
      if (!obj[metaKey] || this.depth >= obj[metaKey].depth) {
        obj[metaKey] = {
          depth: this.depth,
          uid: this._uid
        }

        // Use set to trigger the Observable!
        Vue.set(obj, key, value)
      }
    }

    // create the metaInfo proxy
    createMetaInfoProxy(this.$options, 'metaInfo', updateMetaInfo)
  }
})

let mcid = 0
const TitleComponent = Vue.extend({
  name: 'title-component',
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
  computed: {
    title() {
      return _metaInfo.title
    }
  },
  beforeMount: function () {
    const $cmpnt = this.$el ? this : this.$parent
    if ($cmpnt && $cmpnt.$el) {
      for (const prop in this.$props) {
        const propValue = $cmpnt.$el.getAttribute(prop)
        if (propValue) {

          $cmpnt[prop === 'hid' ? '_hid' : prop] = propValue
        }
      }
    }

    if (!this.hid && !this._hid) {
      this._hid = `mc-${createId(this)}`
    }
  },
  render: function (h) {
    return h('title', {
      attrs: {
        ...this.$props,
        hid: this.hid || this._hid || `mcn-${mcid++}`
      },
    },
    [ this.title ]
    )
  }
})

new Vue(parent).$mount('#app')

const titleComponent = new TitleComponent()

let el = document.querySelector('[hid="mc-title"]')
let $el = titleComponent.$mount(el).$el
if (!el) head.appendChild($el)


setTimeout(() => console.log(_metaInfo), 4000)

