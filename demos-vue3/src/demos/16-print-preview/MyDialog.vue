<script setup lang="ts">
import { ElButton, ElDialog } from 'element-plus'

withDefaults(
  defineProps<{
    modelValue?: boolean
    title?: string
    width?: string
    destroyOnClose?: boolean
    appendToBody?: boolean
    draggable?: boolean
  }>(),
  {
    destroyOnClose: true,
    appendToBody: true,
    draggable: true,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

function close() {
  emit('update:modelValue', false)
}
</script>

<template>
  <ElDialog
    :model-value="modelValue"
    :title="title"
    :width="width"
    :destroy-on-close="destroyOnClose"
    :append-to-body="appendToBody"
    :draggable="draggable"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <slot />

    <template #footer>
      <div class="my-dialog__toolbar">
        <ElButton @click="close">关闭</ElButton>
        <slot name="actions" />
      </div>
    </template>
  </ElDialog>
</template>

<style scoped>
.my-dialog__toolbar {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}
</style>
