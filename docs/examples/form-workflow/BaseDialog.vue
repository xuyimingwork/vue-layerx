<script setup lang="ts">
import { ref } from 'vue'
import { ElButton, ElDialog } from 'element-plus'

withDefaults(
  defineProps<{
    modelValue?: boolean
    title?: string
    width?: string
    destroyOnClose?: boolean
    appendToBody?: boolean
    /** 透传 ElDialog；壳上「取消」经 handleClose 才会走进这里 */
    beforeClose?: (done: (cancel?: boolean) => void) => void
  }>(),
  {
    destroyOnClose: true,
    appendToBody: true,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const dialogRef = ref<{ handleClose: () => void } | null>(null)

/** 与点 X / 遮罩同一条路，才会触发 beforeClose；勿直接 emit false */
function close() {
  dialogRef.value?.handleClose()
}
</script>

<template>
  <ElDialog
    ref="dialogRef"
    :model-value="modelValue"
    :title="title"
    :width="width"
    :destroy-on-close="destroyOnClose"
    :append-to-body="appendToBody"
    :before-close="beforeClose"
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
