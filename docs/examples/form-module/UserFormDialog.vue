<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElButton, ElForm, ElFormItem, ElInput } from 'element-plus'
import { defineLayer, LayerTemplate } from 'vue-layerx'

const props = defineProps<{
  mode?: 'create' | 'edit'
  recordId?: number
  initialName?: string
}>()

const emit = defineEmits<{
  submit: [name: string]
}>()

const name = ref(props.initialName ?? '')
const submitting = ref(false)

const layer = defineLayer({
  props: {
    title: props.mode === 'edit' ? '编辑用户' : '新建用户',
    width: '480px',
  },
  content: { closeOn: ['submit'] },
})

watch(
  () => props.initialName,
  (value) => {
    if (value !== undefined) name.value = value
  },
)

async function handleSubmit() {
  if (!name.value.trim()) return
  submitting.value = true
  await new Promise((r) => setTimeout(r, 400))
  submitting.value = false
  emit('submit', name.value.trim())
}
</script>

<template>
  <ElForm label-width="72px" @submit.prevent="handleSubmit">
    <ElFormItem v-if="recordId" label="ID">
      <span>{{ recordId }}</span>
    </ElFormItem>
    <ElFormItem label="姓名">
      <ElInput v-model="name" placeholder="请输入姓名" autofocus />
    </ElFormItem>
  </ElForm>

  <!-- 弹层：主操作挂 AppDialog #footer；页内：visible-outside 落在表单下 -->
  <LayerTemplate :to="layer" name="footer" visible-outside>
    <template #default="{ inLayer, outsideLayer }">
      <div v-if="outsideLayer" class="inline-actions">
        <ElButton type="primary" :loading="submitting" @click="handleSubmit">保存</ElButton>
      </div>
      <ElButton
        v-else-if="inLayer"
        type="primary"
        :loading="submitting"
        @click="handleSubmit"
      >
        {{ mode === 'edit' ? '保存' : '创建' }}
      </ElButton>
    </template>
  </LayerTemplate>
</template>

<style scoped>
.inline-actions {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--el-border-color-lighter);
}
</style>
