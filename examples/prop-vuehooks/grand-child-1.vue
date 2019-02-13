<template>
  <h3>Grand Child 1</h3>
</template>

<script>
export default {
  metaInfo() {
    return {
      title: this.title
    }
  },
  data() {
    return {
      title: 'Grand Child 1'
    }
  },
  mounted() {
    setTimeout(() => {
      this.title = 'Test'
    }, 3000)

    setTimeout(() => {
      this.title = 'TestTest'
    }, 6000)
  }
}
</script>
