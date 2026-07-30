<script setup lang="ts">
import { ElDrawer } from 'element-plus'

withDefaults(
  defineProps<{
    modelValue?: boolean
    title?: string
    size?: string
    direction?: 'rtl' | 'ltr' | 'ttb' | 'btt'
    destroyOnClose?: boolean
    appendToBody?: boolean
  }>(),
  {
    size: '400px',
    direction: 'rtl',
    destroyOnClose: true,
    appendToBody: true,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<template>
  <ElDrawer
    :model-value="modelValue"
    :size="size"
    :direction="direction"
    :destroy-on-close="destroyOnClose"
    :append-to-body="appendToBody"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <!-- action 放在标题右侧（右上角） -->
    <template #header="{ titleId, titleClass }">
      <div class="base-drawer__header">
        <span :id="titleId" :class="titleClass">{{ title }}</span>
        <div class="base-drawer__action">
          <slot name="action" />
        </div>
      </div>
    </template>

    <slot />
  </ElDrawer>
</template>

<style scoped>
.base-drawer__header {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-right: 8px;
  margin-right: 8px;
}

.base-drawer__action {
  display: flex;
  flex-shrink: 0;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
</style>
