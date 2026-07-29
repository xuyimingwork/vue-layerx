<script setup lang="ts">
import { ref } from 'vue'
import { Message } from 'element-ui'
import { LayerConfirmError } from 'vue-layerx'
import { useDialog } from '../../core/layers'
import ConfirmContent from './ConfirmContent.vue'

const dialog = useDialog(ConfirmContent)
const last = ref('尚未调用')
const loading = ref(false)

async function askDelete() {
  if (loading.value) return
  loading.value = true
  try {
    const result = await dialog.confirm()
    last.value = `resolve · source=${result.source} · data=${JSON.stringify(result.data)}`
    Message.success('已确认删除')
  } catch (e) {
    if (!(e instanceof LayerConfirmError)) throw e
    if (e.code === 'busy') {
      last.value = 'reject · code=busy'
      Message.warning('确认框已打开')
      return
    }
    last.value = `reject · code=close · source=${e.result?.source} · event=${e.result?.event ?? '-'}`
    Message.info('已取消')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <pre class="snippet"><code>const result = await dialog.confirm()
// closeOn.confirmed: true  → resolve
// 取消 / 遮罩 / close()     → LayerConfirmError</code></pre>

    <el-button type="danger" :loading="loading" @click="askDelete">
      {{ loading ? '等待结果…' : 'await confirm()' }}
    </el-button>

    <p class="last">
      最近结果：
      <el-tag size="mini" type="info">{{ last }}</el-tag>
    </p>
  </div>
</template>

<style scoped>
.last {
  margin: 16px 0 0;
  font-size: 13px;
  color: var(--pg-muted);
}
</style>
