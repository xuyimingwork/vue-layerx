<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import { ElButton, ElTag } from 'element-plus'
import { useAlertDialog } from '../../.vitepress/shared/layers'
import AlertContent from './AlertContent.vue'

const AUTO_CLOSE_SECONDS = 5

const alertDialog = useAlertDialog(AlertContent)

const countdown = ref(0)
let autoCloseTimer: ReturnType<typeof setInterval> | null = null

const statusLabel = computed(() => {
  if (countdown.value > 0) return `${countdown.value}s 后自动 hide()`
  return alertDialog.visible ? '已打开' : '已关闭'
})
const statusType = computed(() => {
  if (countdown.value > 0) return 'warning'
  return alertDialog.visible ? 'success' : 'info'
})

function clearAutoClose() {
  if (autoCloseTimer) {
    clearInterval(autoCloseTimer)
    autoCloseTimer = null
  }
  countdown.value = 0
}

function openInfo() {
  clearAutoClose()
  alertDialog.show({
    hideOn: ['confirm'],
    props: {
      tone: 'info',
      message: 'createLayer 工厂默认 tone=info，此处 show 覆盖 message。',
    },
  })
}

function openWarning() {
  clearAutoClose()
  alertDialog.show({
    hideOn: ['confirm'],
    props: {
      tone: 'warning',
      message: 'show() 同时覆盖 content props 与 hideOn。',
    },
    layer: { props: { title: 'show 层覆盖标题' } },
  })
}

function openAutoClose() {
  clearAutoClose()
  alertDialog.show({
    hideOn: ['confirm'],
    props: {
      tone: 'info',
      message: `可点「知道了」正常关闭；或等待 ${AUTO_CLOSE_SECONDS}s 由外部 hide() 收尾。`,
      onConfirm: clearAutoClose,
    },
  })
  countdown.value = AUTO_CLOSE_SECONDS
  autoCloseTimer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearAutoClose()
      alertDialog.hide()
    }
  }, 1000)
}

onUnmounted(() => {
  clearAutoClose()
  alertDialog.hide()
})
</script>

<template>
  <div class="lifecycle">
    <div class="status">
      <span>实例状态：</span>
      <ElTag :type="statusType" size="small">{{ statusLabel }}</ElTag>
    </div>
    <div class="actions">
      <ElButton @click="openInfo">工厂默认 tone</ElButton>
      <ElButton type="warning" @click="openWarning">show 覆盖</ElButton>
      <ElButton type="primary" plain @click="openAutoClose">
        {{ AUTO_CLOSE_SECONDS }}s 倒计时 hide
      </ElButton>
    </div>
  </div>
</template>

<style scoped>
.status {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 14px;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
