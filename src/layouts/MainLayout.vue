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

        <a id="src" href="https://github.com/bestian/q-flashcard" target="_blank" rel="noopener noreferrer"><q-icon name = "ion-logo-github" title="源碼" />源碼</a>
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
          <q-icon name="ion-globe"/>
          <q-select
            class="wide"
            v-model="$i18n.locale"
            :options="langs"
            :label="$t('lang')"
            emit-value
          />
        </q-item>
        <q-item>
          <q-icon name="ion-planet"/>
          <q-select
            class="wide"
            v-model="mode"
            :options="modes"
            :label="$t('mode')"
            emit-value
          />
        </q-item>
        <q-item>
          <q-icon name="ion-american-football"/>
          <q-select
            class="wide"
            v-model="op"
            :options="ops"
            :label="$t('method')"
            emit-value
          />
        </q-item>
        <q-item>
          <q-icon name="ion-arrow-up"/>
          <q-select
            class="wide"
            v-model="max1"
            :options="maxs"
            :label="$t('max1')"
            emit-value
          />
        </q-item>
        <q-item>
          <q-icon name="ion-arrow-up"/>
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
        { label: '簡体中文', value: 'zh-CN' },
        { label: 'US English', value: 'en-us' }
      ],
      op: '+',
      ops: ['+', '-', '×', '÷', 'gcd'],
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
    this.$i18n.locale = navigator.language || 'zh-TW'
    if (navigator.language === 'zh-cn' || navigator.language === 'zh-CN' || navigator.userLanguage === 'zh-cn') {
      this.$i18n.locale = 'zh-CN'
    }
  }
}
</script>

<style type="text/css" scoped="">
  .wide {
    min-width: 100px;
  }

  a {
    font-size: 24px;
    text-decoration: none;
  }

  #src {
    color: black;
  }
</style>
