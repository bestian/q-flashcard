<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated color="primary">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="settings"
          aria-label="Menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />

        <q-toolbar-title>
          {{ $t(mode) }}
          <q-btn dense color="white" round text-color="primary" class="q-ml-sm"
          @click="leftDrawerOpen = !leftDrawerOpen">
            {{ op }}
          </q-btn>
        </q-toolbar-title>

        <q-btn
          flat
          round
          dense
          icon="code"
          color="white"
          href="https://github.com/bestian/q-flashcard"
          target="_blank"
          rel="noopener noreferrer"
          type="a"
        />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      content-class="bg-grey-1"
      :width="220"
    >
      <q-list>
        <q-item-label header class="text-grey-7">
          <q-icon name="settings" size="xs" class="q-mr-xs" />
          {{ $t('settings') }}
        </q-item-label>

        <q-separator spaced />

        <q-item class="q-py-sm">
          <q-item-section avatar>
            <q-icon name="language" />
          </q-item-section>
          <q-item-section>
            <q-select
              class="wide"
              v-model="$i18n.locale"
              :options="langs"
              :label="$t('lang')"
              emit-value
              map-options
            />
          </q-item-section>
        </q-item>

        <q-separator spaced />

        <q-item class="q-py-sm">
          <q-item-section avatar>
          <q-icon name="tune" />
          </q-item-section>
          <q-item-section>
            <q-select
              class="wide"
              v-model="mode"
              :options="modes"
              :label="$t('mode')"
              emit-value
              map-options
            />
          </q-item-section>
        </q-item>

        <q-separator spaced />

        <q-item tag="label" class="q-py-sm" clickable>
          <q-item-section avatar>
            <q-checkbox v-model="resetOnWrong" color="primary" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ $t('resetOnWrong') }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-separator spaced />

        <q-item class="q-py-sm">
          <q-item-section avatar>
            <q-icon name="calculate" />
          </q-item-section>
          <q-item-section>
            <q-select
              class="wide"
              v-model="op"
              :options="ops"
              :label="$t('method')"
              emit-value
            />
          </q-item-section>
        </q-item>

        <q-separator spaced />

        <q-item class="q-py-sm">
          <q-item-section avatar>
            <q-icon name="filter_1" />
          </q-item-section>
          <q-item-section>
            <q-select
              class="wide"
              v-model="max1"
              :options="maxs"
              :label="$t('max1')"
              emit-value
            />
          </q-item-section>
        </q-item>

        <q-item class="q-py-sm">
          <q-item-section avatar>
            <q-icon name="filter_2" />
          </q-item-section>
          <q-item-section>
            <q-select
              class="wide"
              v-model="max2"
              :options="maxs"
              :label="$t('max2')"
              emit-value
            />
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view :op="op" :mode="mode" :max1="max1" :max2="max2" :resetOnWrong="resetOnWrong"/>
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
      mode: 'quiz',
      modes: [
        { label: '選擇題', value: 'multiple-choice' },
        { label: '閃卡', value: 'flashcard' },
        { label: '挑戰', value: 'quiz' }
      ],
      max1: 20,
      max2: 10,
      maxs: [5, 10, 20, 50, 100, 500, 1000],
      resetOnWrong: false
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
    flex: 1;
  }
</style>
