import Vue from 'vue'
import createApp from './app'
import createHead from './head'

const head = createHead()
const app = createApp({ __vm_head: head })

const initialHead = app.$options.head()

let staticChilds
if (initialHead.staticChilds) {
  head.staticChilds = initialHead.staticChilds
  delete initialHead.staticChilds
}

//app.__vm_head = head
Vue.set(head, 'metaInfo', initialHead)

app.$mount('#app')
head.$mount('head:first-child')

// Monitor DOM to check what elms/attrs are added/changed/removed
const headEl = document.getElementsByTagName('head')[0]
const observer = new MutationObserver((list, observer) => {
  console.log(list)
})

observer.observe(headEl, {
  attributes: true,
  childList: true,
  subtree: true
})

setTimeout(() => {
  // manipulated through app
  app.charset = 'utf-16'

  head.$nextTick(() => {
    // direct manipulation
    head.metaInfo.description = 'Hello there?!'
  })
}, 2000)
