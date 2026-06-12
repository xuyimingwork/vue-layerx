<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import { ElButton, ElTag } from 'element-plus'
import { useAlertDialog } from '../../layers'
import AlertBox from '../contents/AlertBox.vue'

const AUTO_CLOSE_SECONDS = 5

/** 故意不在 useDialog 设 hideOn，改在 show() 传入 */
const alertDialog = useAlertDialog(AlertBox)

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
      message: 'createLayerx 工厂默认 tone=info，此处 show 覆盖 message。',
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

/** 模拟组件卸载等外部生命周期：由调用方定时 hide()，非正常弹窗内关闭 */
function openAutoClose() {
  clearAutoClose()
  alertDialog.show({
    hideOn: ['confirm'],
    props: {
      tone: 'info',
      message: `弹窗内可点「知道了」正常关闭；若不理会，${AUTO_CLOSE_SECONDS}s 后由外部 countdown 调用 hide()（模拟路由离开、组件卸载）。`,
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
  <div class="programmatic-panel">
    <div class="status">
      <span>实例状态：</span>
      <ElTag :type="statusType" size="small">{{ statusLabel }}</ElTag>
      <code>alertDialog.visible</code>
    </div>
    <div class="actions">
      <ElButton @click="openInfo">打开（工厂默认 tone）</ElButton>
      <ElButton type="warning" @click="openWarning">打开（show 覆盖）</ElButton>
      <ElButton type="primary" plain @click="openAutoClose">
        打开（{{ AUTO_CLOSE_SECONDS }}s 倒计时 hide）
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

.status code {
  padding: 1px 4px;
  border-radius: 3px;
  background: var(--el-fill-color-light);
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
