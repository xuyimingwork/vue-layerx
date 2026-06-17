<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElButton, ElForm, ElFormItem, ElInput, ElTag } from 'element-plus'
import { defineLayer, LayerTemplate } from 'vue-layerx'

const props = defineProps<{
  mode?: 'create' | 'edit'
  recordId?: number
  initialName?: string
}>()

const emit = defineEmits<{
  success: [name: string]
  cancel: []
}>()

const name = ref(props.initialName ?? '')

defineLayer({
  props: {
    title: props.mode === 'edit' ? '编辑用户' : '新建用户',
  },
})

watch(
  () => props.initialName,
  (value) => {
    if (value !== undefined) name.value = value
  },
)

function submit() {
  if (!name.value.trim()) return
  emit('success', name.value.trim())
}

function cancel() {
  emit('cancel')
}
</script>

<template>
  <ElForm label-width="72px" @submit.prevent="submit">
    <ElFormItem>
      <slot name="header">
        <span class="form-header">请填写用户信息</span>
      </slot>
    </ElFormItem>
    <ElFormItem v-if="recordId" label="ID">
      <span>{{ recordId }}</span>
    </ElFormItem>
    <ElFormItem label="姓名">
      <ElInput v-model="name" placeholder="请输入姓名" />
    </ElFormItem>
  </ElForm>

  <LayerTemplate name="footer" visible-outside>
    <template #default="{ inLayer, outsideLayer }">
      <div :class="['form-footer', { 'form-footer--inline': outsideLayer }]">
        <ElTag v-if="outsideLayer" size="small" type="info" effect="plain">
          页内 footer · outsideLayer
        </ElTag>
        <ElTag v-else-if="inLayer" size="small" type="success" effect="plain">
          弹层 footer · inLayer
        </ElTag>
        <div class="form-footer__actions">
          <ElButton type="primary" @click="submit">
            {{ mode === 'edit' ? '保存' : '创建' }}
          </ElButton>
          <ElButton @click="cancel">取消</ElButton>
        </div>
      </div>
    </template>
  </LayerTemplate>
</template>

<style scoped>
.form-header {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.form-footer {
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-footer--inline {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.form-footer__actions {
  display: flex;
  gap: 8px;
}
</style>
