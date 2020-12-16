<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />

        <q-toolbar-title>
          {{ $t(mode) }}
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      content-class="bg-grey-1"
    >
      <q-list>
        <q-item>
          <q-select
            class="wide"
            v-model="$i18n.locale"
            :options="langs"
            :label="$t('lang')"
            emit-value
          />
        </q-item>
        <q-item>
          <q-select
            class="wide"
            v-model="mode"
            :options="modes"
            :label="$t('mode')"
            emit-value
          />
        </q-item>
        <q-item>
          <q-select
            class="wide"
            v-model="op"
            :options="ops"
            :label="$t('method')"
            emit-value
          />
        </q-item>
        <q-item>
          <q-select
            class="wide"
            v-model="max1"
            :options="maxs"
            :label="$t('max1')"
            emit-value
          />
        </q-item>
        <q-item>
          <q-select
            class="wide"
            v-model="max2"
            :options="maxs"
            :label="$t('max2')"
            emit-value
          />
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view :op="op" :mode="mode" :max1="max1" :max2="max2"/>
    </q-page-container>
  </q-layout>
</template>

<script>

export default {
  name: 'MainLayout',
  components: { },
  data () {
    return {
      leftDrawerOpen: false,
      langs: [
        { label: '繁體中文', value: 'zh-TW' },
        { label: 'US English', value: 'en-us' }
      ],
      op: '+',
      ops: ['+', '-', '×'],
      mode: 'flashcard',
      modes: [
        { label: '閃卡', value: 'flashcard' },
        { label: '挑戰', value: 'quiz' }
      ],
      max1: 20,
      max2: 10,
      maxs: [5, 10, 20, 50, 100, 500, 1000]
    }
  },
  mounted () {
    this.$i18n.locale = 'zh-TW'
  }
}
</script>

<style type="text/css" scoped="">
  .wide {
    min-width: 100px;
  }
</style>
