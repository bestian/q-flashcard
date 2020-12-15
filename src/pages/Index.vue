<template>
  <q-page class="flex flex-center">
    <q-card id = "main" padding @click = "flip()">
      <q-card-section>
        <h1 v-show="s == 0">{{ n1 }} {{ op }} {{ n2 }}</h1>
        <h1 v-show="s == 1">{{ ans }}</h1>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
export default {
  name: 'PageIndex',
  data () {
    return {
      n1: 3,
      n2: 5,
      op: '+',
      ans: null,
      s: 0
    }
  },
  methods: {
    flip () {
      if (this.s === 0) {
        this.s += 1
        if (this.op === '+') {
          this.ans = this.n1 + this.n2
        }
        if (this.op === '-') {
          this.ans = this.n1 - this.n2
        }
        if (this.op === '×') {
          this.ans = this.n1 * this.n2
        }
      } else {
        this.s = 0
        this.n1 = Math.floor(Math.random() * 20)
        this.n2 = Math.floor(Math.random() * 10)
      }
    }
  }
}
</script>

<style type="text/css" scoped="">
  #main {
    cursor: pointer;
    width: 66vw;
    text-align: center;
  }
</style>
