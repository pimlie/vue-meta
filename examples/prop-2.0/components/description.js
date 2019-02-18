import meta from './meta'

export default {
  name: 'description-component',
  functional: true,
  props: {
    description: String
  },
  render(h, { props: { description } }) {
    return h(meta, {
      props: {
        name: 'description',
        content: description
      }
    })
  }
}
