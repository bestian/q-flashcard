<template>
  <q-page class="flex flex-center">
    <q-card id = "main" padding v-touch-swipe.mouse="flip" @click="flip()">
      <q-card-section v-if="mode=='flashcard'">
        <h3 v-show="s == 0">{{ n1 }} {{ op }} {{ n2 }}</h3>
        <h1 v-show="s == 1">{{ ans }}</h1>
      </q-card-section>
      <q-card-section v-if="mode=='quiz'">
        <h3 v-show="s == 0">{{ n1 }} {{ op }} {{ n2 }}
        </h3>
        <h1 v-show="s == 1">{{ ans }}</h1>
      </q-card-section>
      <q-input :autofocus="true" v-if="mode=='quiz'" v-model="myAns" :label = "$t('enter your answer')"/>
      <q-btn :size="'xl'" v-if="mode=='quiz'" color="primary" @click="test()">{{ s == 0 ? $t('test') : $t('next') }}</q-btn>
    </q-card>
  </q-page>
</template>

<script>
export default {
  name: 'PageIndex',
  props: ['op', 'max1', 'max2', 'mode'],
  data () {
    return {
      n1: 3,
      n2: 5,
      ans: null,
      s: 0,
      myAns: null
    }
  },
  methods: {
    test () {
      if (this.op === '+') {
        this.ans = this.n1 + this.n2
      }
      if (this.op === '-') {
        this.ans = this.n1 - this.n2
      }
      if (this.op === '×') {
        this.ans = this.n1 * this.n2
      }
      if (this.s === 0) {
        console.log(this.ans)
        console.log(parseInt(this.myAns))
        if (parseInt(this.myAns) === this.ans) {
          this.s = 1
          this.myAns = null
        } else {
          window.alert(this.$t('wrong'))
        }
      } else {
        this.s = 0
        this.n1 = Math.floor(Math.random() * this.max1)
        this.n2 = Math.floor(Math.random() * this.max2)
      }
    },
    flip () {
      if (this.mode === 'quiz') {
        return
      }
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
        this.n1 = Math.floor(Math.random() * this.max1)
        this.n2 = Math.floor(Math.random() * this.max2)
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
