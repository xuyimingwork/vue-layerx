<script setup lang="ts">
import { ref } from 'vue'
import { ElConfigProvider } from 'element-plus'
import HostPanel from './HostPanel.vue'

type EpSize = 'large' | 'default' | 'small'

/** ConfigProvider 必须是 Host（useDialog / bindHost）的祖先 */
const epSize = ref<EpSize>('large')
</script>

<template>
  <ElConfigProvider :size="epSize">
    <HostPanel v-model:ep-size="epSize" />
  </ElConfigProvider>
</template>
