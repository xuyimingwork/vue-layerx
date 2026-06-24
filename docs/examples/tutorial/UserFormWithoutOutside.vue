<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ElButton, ElForm, ElFormItem, ElInput } from 'element-plus'
import { defineLayer, LayerTemplate } from 'vue-layerx'

const props = withDefaults(
  defineProps<{
    mode?: 'view' | 'edit' | 'create'
    recordId?: number
    initialName?: string
    email?: string
    role?: string
  }>(),
  { mode: 'view' },
)

const emit = defineEmits<{ submit: [name: string] }>()

const name = ref(props.initialName ?? '')
const submitting = ref(false)
const snapshot = computed(() => props.initialName ?? '')
const dirty = computed(() => name.value !== snapshot.value)
const readonly = computed(() => props.mode === 'view')

defineLayer({
  props: {
    title:
      props.mode === 'view'
        ? '用户详情'
        : props.mode === 'edit'
          ? '编辑用户'
          : '新建用户',
    width: props.mode === 'view' ? '420px' : '480px',
    size: '85vw',
    direction: 'rtl',
    beforeClose: (done: () => void) => {
      if (readonly.value || !dirty.value) {
        done()
        return
      }
      if (window.confirm('内容未保存，确定关闭？')) done()
    },
  },
  content: { closeOn: ['submit'] },
})

watch(
  () => props.initialName,
  (v) => {
    if (v !== undefined) name.value = v
  },
)

async function handleSubmit() {
  if (readonly.value || !name.value.trim()) return
  submitting.value = true
  await new Promise((r) => setTimeout(r, 300))
  submitting.value = false
  emit('submit', name.value.trim())
}
</script>

<template>
  <ElForm label-width="72px" @submit.prevent="handleSubmit">
    <ElFormItem v-if="recordId" label="ID"><span>{{ recordId }}</span></ElFormItem>
    <ElFormItem label="姓名">
      <ElInput v-model="name" :disabled="readonly" placeholder="请输入姓名" />
    </ElFormItem>
    <ElFormItem v-if="email" label="邮箱"><ElInput :model-value="email" disabled /></ElFormItem>
    <ElFormItem v-if="role" label="角色"><ElInput :model-value="role" disabled /></ElFormItem>
  </ElForm>

  <!-- 无 visible-outside：footer 只在弹层 inLayer 时出现 -->
  <LayerTemplate v-if="mode !== 'view'" name="footer">
    <ElButton type="primary" :loading="submitting" @click="handleSubmit">
      {{ mode === 'edit' ? '保存' : '创建' }}
    </ElButton>
  </LayerTemplate>
</template>
