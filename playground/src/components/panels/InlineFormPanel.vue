<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import CreateForm from '../CreateForm.vue'

const lastSaved = ref('')

function onSuccess(name: string) {
  lastSaved.value = name
  ElMessage.success(`页内表单已保存：${name}`)
}
</script>

<template>
  <div class="inline-form">
    <p class="note">
      同一 <code>CreateForm</code> 直接渲染在页面内：
      <code>useDialog.layer()</code> 不激活，<code>LayerSlot</code>（footer）不出 DOM。
    </p>
    <CreateForm mode="create" @success="onSuccess" />
    <p v-if="lastSaved" class="result">最近保存：{{ lastSaved }}</p>
  </div>
</template>

<style scoped>
.note {
  margin: 0 0 16px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  line-height: 1.6;
}

.note code {
  padding: 1px 4px;
  border-radius: 3px;
  background: var(--el-fill-color-light);
  font-size: 12px;
}

.result {
  margin: 12px 0 0;
  font-size: 13px;
  color: var(--el-color-success);
}
</style>
