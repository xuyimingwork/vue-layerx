<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElButton, ElMessage, ElTag, ElDialog } from 'element-plus'
import { createLayer, LayerConfirmError } from 'vue-layerx'
import HelloContent from './HelloContent.vue'
import ConfirmContent from './ConfirmContent.vue'
import smokePkg from '../package.json'

const installed = smokePkg.dependencies['vue-layerx']

const useDialog = createLayer(ElDialog)
const hello = useDialog(HelloContent)
const confirmDialog = useDialog(ConfirmContent)

/** beta.3: boolean；beta.4+: ComputedRef — 两边都能读 */
function readVisible(layer: { visible: boolean | { value: boolean } }) {
  const v = layer.visible
  return typeof v === 'object' && v !== null && 'value' in v ? v.value : v
}

const helloOpen = computed(() => readVisible(hello))
const confirmOpen = computed(() => readVisible(confirmDialog))
const lastConfirm = ref('尚未调用 confirm()')

async function runConfirm() {
  try {
    const result = await confirmDialog.confirm()
    lastConfirm.value = `resolve · source=${result.source} · data=${JSON.stringify(result.data)}`
    ElMessage.success('confirm resolve')
  } catch (e) {
    if (!(e instanceof LayerConfirmError)) throw e
    lastConfirm.value = `reject · code=${e.code}`
    ElMessage.info(`confirm reject (${e.code})`)
  }
}
</script>

<template>
  <main class="smoke">
    <h1>vue-layerx smoke</h1>
    <p class="meta">
      已声明依赖：<code>vue-layerx@{{ installed }}</code>
      · hello.visible=<ElTag size="small" :type="helloOpen ? 'success' : 'info'">{{ helloOpen }}</ElTag>
      · confirm.visible=<ElTag size="small" :type="confirmOpen ? 'success' : 'info'">{{ confirmOpen }}</ElTag>
    </p>

    <section>
      <h2>open / close</h2>
      <ElButton type="primary" @click="hello.open()">hello.open()</ElButton>
      <ElButton @click="hello.close()">hello.close()</ElButton>
    </section>

    <section>
      <h2>confirm</h2>
      <ElButton type="danger" @click="runConfirm()">confirmDialog.confirm()</ElButton>
      <p class="log">{{ lastConfirm }}</p>
    </section>
  </main>
</template>

<style>
html,
body,
#app {
  margin: 0;
  min-height: 100%;
  font-family: system-ui, sans-serif;
  background: #f5f7fa;
  color: #303133;
}

.smoke {
  max-width: 640px;
  margin: 0 auto;
  padding: 32px 20px;
}

.smoke h1 {
  margin: 0 0 8px;
  font-size: 22px;
}

.meta {
  margin: 0 0 24px;
  font-size: 14px;
  color: #606266;
}

.smoke section {
  margin-bottom: 28px;
  padding: 16px;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 1px 2px rgb(0 0 0 / 6%);
}

.smoke h2 {
  margin: 0 0 12px;
  font-size: 15px;
}

.log {
  margin: 12px 0 0;
  font-size: 13px;
  color: #909399;
}
</style>
