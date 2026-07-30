<script setup lang="ts">
import { ElButton, ElDialog } from 'element-plus'

withDefaults(
  defineProps<{
    modelValue?: boolean
    title?: string
    width?: string
    destroyOnClose?: boolean
    appendToBody?: boolean
  }>(),
  {
    destroyOnClose: true,
    appendToBody: true,
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
    @update:model-value="emit('update:modelValue', $event)"
  >
    <slot />

    <!--
      取消固定由壳提供，业务区走 action。
      内容投递的 action 与「取消」并存、互不覆盖——详情 view 可见「取消」+ 内容侧提示图标。
    -->
    <template #footer>
      <div class="base-dialog__action">
        <ElButton @click="close">取消</ElButton>
        <slot name="action" />
      </div>
    </template>
  </ElDialog>
</template>

<style scoped>
.base-dialog__action {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}
</style>
