<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElButton, ElTag } from 'element-plus'
import { useDialog } from '../../.vitepress/shared/layers'
import PanelContent from './PanelContent.vue'

const instanceA = useDialog(PanelContent, { closeOn: ['close'] })

const instanceB = instanceA.clone({
  container: { props: { width: '640px', title: '实例 B（clone · 640px）' } },
})

const logs = ref<string[]>([])
const tick = ref(0)

function stamp() {
  return new Date().toLocaleTimeString('zh-CN', { hour12: false })
}

function pushLog(message: string) {
  logs.value.unshift(`[${stamp()}] ${message}`)
  tick.value++
}

const status = computed(() => {
  void tick.value
  const domDialogs =
    typeof document !== 'undefined'
      ? document.querySelectorAll('.el-overlay-dialog').length
      : 0
  return {
    aVisible: instanceA.visible.value,
    bVisible: instanceB.visible.value,
    domDialogs,
  }
})

function openA() {
  instanceA.open({
    props: {
      instanceId: 'A',
      note: '这是 base 实例。footer 里可点「从 A 打开 B」。',
      onOpenB: openBFromA,
      onAction: () => pushLog('收到实例 A 的 action 事件'),
    },
    container: { props: { title: '实例 A（base · 480px）' } },
  })
  pushLog('instanceA.open() — A.visible=true')
}

function openBFromA() {
  pushLog('A footer 按钮 → instanceB.open()（未先 hide A）')
  instanceB.open({
    props: {
      instanceId: 'B',
      note: 'B 使用独立 layerRuntime，与 A 并行打开时两层 Dialog 同时存在。',
      onAction: () => pushLog('收到实例 B 的 action 事件'),
    },
  })
  pushLog(`状态快照：A=${instanceA.visible.value}, B=${instanceB.visible.value}`)
}

function openBFromPage() {
  instanceB.open({
    props: {
      instanceId: 'B',
      note: '从页面直接打开 B，用于对比 A 未关时的行为。',
      onAction: () => pushLog('收到实例 B 的 action 事件'),
    },
  })
}

function hideA() {
  instanceA.close()
  pushLog('instanceA.close()')
}

function hideB() {
  instanceB.close()
  pushLog('instanceB.close()')
}
</script>

<template>
  <div class="clone-parallel">
    <div class="clone-parallel__status">
      <ElTag :type="status.aVisible ? 'success' : 'info'">A.visible = {{ status.aVisible }}</ElTag>
      <ElTag :type="status.bVisible ? 'success' : 'info'">B.visible = {{ status.bVisible }}</ElTag>
      <ElTag type="warning">DOM overlay ≈ {{ status.domDialogs }}</ElTag>
    </div>

    <div class="clone-parallel__actions">
      <ElButton type="primary" @click="openA">1. 打开 A</ElButton>
      <ElButton type="warning" plain @click="openBFromPage">2. 不关 A，从页面打开 B</ElButton>
      <ElButton @click="hideA">hide A</ElButton>
      <ElButton @click="hideB">hide B</ElButton>
    </div>

    <div v-if="logs.length" class="clone-parallel__log">
      <p class="clone-parallel__log-title">事件日志（新在上）</p>
      <ul>
        <li v-for="(line, index) in logs" :key="index">{{ line }}</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.clone-parallel__status {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.clone-parallel__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.clone-parallel__log {
  padding: 10px 12px;
  border-radius: 6px;
  background: var(--el-fill-color-lighter);
}

.clone-parallel__log-title {
  margin: 0 0 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
}

.clone-parallel__log ul {
  margin: 0;
  padding-left: 1.1rem;
  max-height: 160px;
  overflow: auto;
  font-size: 12px;
  line-height: 1.6;
}
</style>
