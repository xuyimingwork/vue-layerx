<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElButton, ElTag } from 'element-plus'
import { useDialog } from '../../core/layers'
import PanelContent from './PanelContent.vue'

const instanceA = useDialog(PanelContent, { hideOn: ['close'] })

const instanceB = instanceA.clone({
  layer: { props: { width: '640px', title: '实例 B（clone · 640px）' } },
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
  return {
    aVisible: instanceA.visible,
    bVisible: instanceB.visible,
    domDialogs: document.querySelectorAll('.el-overlay-dialog').length,
  }
})

function openA() {
  instanceA.show({
    props: {
      instanceId: 'A',
      note: '这是 base 实例。footer 里可点「从 A 打开 B」。',
      onOpenB: openBFromA,
      onAction: () => pushLog('收到实例 A 的 action 事件'),
    },
    layer: { props: { title: '实例 A（base · 480px）' } },
  })
  pushLog('instanceA.show() — A.visible=true')
  pushLog(`状态快照：A=${instanceA.visible}, B=${instanceB.visible}`)
}

function openBFromA() {
  pushLog('A footer 按钮 → instanceB.show()（未先 hide A）')
  instanceB.show({
    props: {
      instanceId: 'B',
      note: 'B 使用独立 layerRuntime，与 A 并行打开时两层 Dialog 同时存在。',
      onAction: () => pushLog('收到实例 B 的 action 事件'),
    },
  })
  pushLog(`状态快照：A=${instanceA.visible}, B=${instanceB.visible}`)
  pushLog(`document 中 .el-overlay-dialog 数量：${document.querySelectorAll('.el-overlay-dialog').length}`)
}

function openBFromPage() {
  pushLog('页面按钮 → instanceB.show()（未先 hide A）')
  instanceB.show({
    props: {
      instanceId: 'B',
      note: '从页面直接打开 B，用于对比 A 未关时的行为。',
      onAction: () => pushLog('收到实例 B 的 action 事件'),
    },
  })
  pushLog(`状态快照：A=${instanceA.visible}, B=${instanceB.visible}`)
}

function hideA() {
  instanceA.hide()
  pushLog('instanceA.hide()')
  pushLog(`状态快照：A=${instanceA.visible}, B=${instanceB.visible}`)
}

function hideB() {
  instanceB.hide()
  pushLog('instanceB.hide()（仅关闭 B，挂载点保留至 Host 卸载）')
  pushLog(`状态快照：A=${instanceA.visible}, B=${instanceB.visible}`)
}

function probeDom() {
  pushLog(
    `探测：A.visible=${instanceA.visible}, B.visible=${instanceB.visible}, overlay=${document.querySelectorAll('.el-overlay-dialog').length}`,
  )
}
</script>

<template>
  <div class="clone-parallel">
    <p class="clone-parallel__intro">
      先打开实例 A，再在 A 的 footer 点击「从 A 打开 B」。每个 Layer 实例（含
      <code>clone()</code> 派生）拥有独立 <code>layerRuntime</code>，并行
      <code>show()</code> 时 <code>visible</code> 与 DOM 一致，互不影响关闭。
    </p>

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
      <ElButton link type="primary" @click="probeDom">探测 DOM / visible</ElButton>
    </div>

    <ol class="clone-parallel__steps">
      <li>点「打开 A」→ 应看到标题为「实例 A」的 Dialog。</li>
      <li>在 A 的 footer 点「从 A 打开 B」→ A、B 同时 visible，DOM overlay 数量为 2（B 叠在 A 上）。</li>
      <li>在 A 上点「触发 action」→ 日志仍收到 A 的事件（A 的 DOM 未被覆盖）。</li>
      <li>点 hide B → 仅 B 关闭，A 仍保持打开；对未打开的 B 执行 hide 也不影响 A。</li>
    </ol>

    <div v-if="logs.length" class="clone-parallel__log">
      <p class="clone-parallel__log-title">事件日志（新在上）</p>
      <ul>
        <li v-for="(line, index) in logs" :key="index">{{ line }}</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.clone-parallel__intro {
  margin: 0 0 12px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--el-text-color-secondary);
}

.clone-parallel__intro code {
  padding: 1px 4px;
  border-radius: 3px;
  background: var(--el-fill-color-light);
  font-size: 12px;
}

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

.clone-parallel__steps {
  margin: 0 0 12px;
  padding-left: 1.25rem;
  font-size: 13px;
  line-height: 1.7;
  color: var(--el-text-color-regular);
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
  max-height: 200px;
  overflow: auto;
  font-size: 12px;
  line-height: 1.6;
  color: var(--el-text-color-regular);
}
</style>
