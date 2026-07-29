<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn.mjs'
import en from 'element-plus/es/locale/lang/en.mjs'
import ProvideInjectPanel from './ProvideInjectPanel.vue'

type EpSize = 'large' | 'default' | 'small'
type EpLocaleKey = 'zh-cn' | 'en'

const epSize = ref<EpSize>('large')
const epLocaleKey = ref<EpLocaleKey>('zh-cn')

const epLocale = computed(() => (epLocaleKey.value === 'zh-cn' ? zhCn : en))
</script>

<template>
  <ElConfigProvider :size="epSize" :locale="epLocale">
    <ProvideInjectPanel v-model:ep-size="epSize" v-model:ep-locale-key="epLocaleKey" />
  </ElConfigProvider>
</template>
