<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElButton, ElInput, ElMessageBox } from 'element-plus'
import { LayerSlot } from 'vue-layerx'
import { useDialog } from '../../layers'

const props = defineProps<{
  initialContent?: string
}>()

const emit = defineEmits<{
  save: [content: string]
  cancel: []
}>()

const content = ref(props.initialContent ?? '')
const footerRef = ref()
const dirty = computed(() => content.value !== (props.initialContent ?? ''))

useDialog.layer({
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
  slots: { footer: footerRef },
})

function save() {
  if (!content.value.trim()) return
  emit('save', content.value.trim())
}

function cancel() {
  emit('cancel')
}
</script>

<template>
  <p class="hint">
    修改下方内容后，点右上角 X 或遮罩关闭，会触发 <code>beforeClose</code> 二次确认。
  </p>
  <ElInput
    v-model="content"
    type="textarea"
    :rows="4"
    placeholder="写点什么..."
  />
  <p v-if="dirty" class="dirty">● 有未保存修改</p>

  <LayerSlot ref="footerRef">
    <ElButton type="primary" :disabled="!dirty" @click="save">保存</ElButton>
    <ElButton @click="cancel">取消</ElButton>
  </LayerSlot>
</template>

<style scoped>
.hint {
  margin: 0 0 12px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  line-height: 1.5;
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
