<script setup lang="ts">
import { ElButton, ElDrawer } from 'element-plus'

withDefaults(
  defineProps<{
    modelValue?: boolean
    title?: string
    size?: string
    direction?: 'rtl' | 'ltr' | 'ttb' | 'btt'
  }>(),
  {
    size: '360px',
    direction: 'rtl',
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
    destroy-on-close
    append-to-body
    @update:model-value="emit('update:modelValue', $event)"
  >
    <template #header>
      <span>{{ title }}</span>
    </template>

    <slot />

    <template #footer>
      <div class="base-drawer__footer">
        <ElButton @click="emit('update:modelValue', false)">关闭</ElButton>
        <div class="base-drawer__actions">
          <slot name="footer" />
        </div>
      </div>
    </template>
  </ElDrawer>
</template>

<style scoped>
.base-drawer__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.base-drawer__actions {
  display: flex;
  gap: 8px;
}
</style>
