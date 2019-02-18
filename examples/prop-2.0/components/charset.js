import meta from './meta'

export default {
  name: 'charset',
  functional: true,
  props: {
    charset: {
      type: String,
      default: 'utf-8'
    }
  },
  render(h, { props }) {
    return h(meta, {
      props
    })
  }
}
