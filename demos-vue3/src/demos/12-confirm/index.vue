<script setup lang="ts">
import { ref } from 'vue'
import { ElButton, ElMessage, ElTag } from 'element-plus'
import { LayerConfirmError } from 'vue-layerx'
import { useDialog } from '../../core/layers'
import ConfirmContent from './ConfirmContent.vue'

const dialog = useDialog(ConfirmContent)
const last = ref<string>('尚未调用')

async function askDelete() {
  try {
    const result = await dialog.confirm()
    last.value = `resolve · source=${result.source} · data=${JSON.stringify(result.data)}`
    ElMessage.success('已确认删除')
  } catch (e) {
    if (!(e instanceof LayerConfirmError)) throw e
    if (e.code === 'busy') {
      last.value = 'reject · code=busy'
      ElMessage.warning('确认框已打开')
      return
    }
    last.value = `reject · code=close · source=${e.result?.source} · event=${e.result?.event ?? '-'}`
    ElMessage.info('已取消')
  }
}

function forceCloseOk() {
  if (!dialog.visible) {
    ElMessage.warning('请先打开 confirm')
    return
  }
  dialog.close({ confirmed: true, args: [{ action: 'force' }] })
}
</script>

<template>
  <pre class="snippet"><code>const result = await dialog.confirm()
// closeOn.confirmed: true  → resolve
// 取消 / 遮罩 / close()     → LayerConfirmError code:'close'</code></pre>

  <p class="hint">
    content 须声明
    <code>closeOn: { confirm: { when: 'always', confirmed: true } }</code>
    ；数组糖默认 <code>confirmed: false</code>，只会 reject。
  </p>

  <div class="actions">
    <ElButton type="danger" @click="askDelete">await confirm()</ElButton>
    <ElButton @click="forceCloseOk">close({ confirmed: true })</ElButton>
  </div>

  <p class="last">
    最近结果：
    <ElTag size="small" type="info">{{ last }}</ElTag>
  </p>
</template>

<style scoped>
.snippet {
  margin: 0 0 12px;
  padding: 12px 14px;
  border-radius: 6px;
  background: var(--el-fill-color-light);
  font-size: 13px;
  line-height: 1.6;
  overflow-x: auto;
}

.snippet code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.hint {
  margin: 0 0 16px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--el-text-color-secondary);
}

.hint code {
  padding: 1px 4px;
  border-radius: 3px;
  background: var(--el-fill-color-light);
  font-size: 12px;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.last {
  margin: 0;
  font-size: 13px;
  color: var(--el-text-color-regular);
}
</style>
