<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElButton, ElInput, ElMessageBox } from 'element-plus'
import { defineLayer, LayerTemplate } from 'vue-layerx'

const props = defineProps<{
  initialContent?: string
}>()

const emit = defineEmits<{
  submit: [content: string]
}>()

const content = ref(props.initialContent ?? '')
const dirty = computed(() => content.value !== (props.initialContent ?? ''))

defineLayer({
  props: {
    title: '编辑草稿',
    beforeClose: (done: () => void) => {
      if (!dirty.value) {
        done()
        return
      }
      ElMessageBox.confirm('内容未保存，确定关闭？', '提示', {
        type: 'warning',
        confirmButtonText: '放弃修改',
        cancelButtonText: '继续编辑',
      })
        .then(() => done())
        .catch(() => {})
    },
  },
  hideOn: ['submit'],
})

function handleSubmit() {
  if (!content.value.trim()) return
  emit('submit', content.value.trim())
}
</script>

<template>
  <p class="hint">
    点 X 或遮罩 → <code>beforeClose</code>；点 AppDialog「取消」→ 直接关层；点「保存」→
    <code>hideOn</code>。
  </p>
  <ElInput v-model="content" type="textarea" :rows="4" placeholder="写点什么..." />
  <p v-if="dirty" class="dirty">● 有未保存修改</p>

  <LayerTemplate name="footer">
    <ElButton type="primary" :disabled="!dirty" @click="handleSubmit">保存</ElButton>
  </LayerTemplate>
</template>

<style scoped>
.hint {
  margin: 0 0 12px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.hint code {
  padding: 1px 4px;
  border-radius: 3px;
  background: var(--el-fill-color-light);
  font-size: 12px;
}

.dirty {
  margin: 8px 0 0;
  font-size: 13px;
  color: var(--el-color-warning);
}
</style>
