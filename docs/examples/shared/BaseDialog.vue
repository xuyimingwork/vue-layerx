<script setup lang="ts">
import { ElButton, ElDialog } from 'element-plus'

withDefaults(
  defineProps<{
    modelValue?: boolean
    title?: string
    width?: string
    beforeClose?: (done: () => void) => void
  }>(),
  {
    width: '480px',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<template>
  <ElDialog
    :model-value="modelValue"
    :title="title"
    :width="width"
    :before-close="beforeClose"
    destroy-on-close
    append-to-body
    @update:model-value="emit('update:modelValue', $event)"
  >
    <slot />

    <template #footer>
      <div class="base-dialog__footer">
        <ElButton @click="emit('update:modelValue', false)">关闭</ElButton>
        <div class="base-dialog__actions">
          <slot name="footer" />
        </div>
      </div>
    </template>
  </ElDialog>
</template>

<style scoped>
.base-dialog__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.base-dialog__actions {
  display: flex;
  gap: 8px;
}
</style>
