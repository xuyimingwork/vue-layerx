<script setup lang="ts">
import { ElButton, ElTag } from 'element-plus'
import { defineLayer, LayerTemplate } from 'vue-layerx'

const props = defineProps<{
  instanceId: 'A' | 'B'
  note?: string
  onOpenB?: () => void
  onAction?: () => void
}>()

const emit = defineEmits<{
  close: []
}>()

defineLayer({
  props: {
    title: props.instanceId === 'A' ? '实例 A（base）' : '实例 B（clone）',
  },
})

function onActionClick() {
  props.onAction?.()
}
</script>

<template>
  <div class="panel">
    <ElTag :type="instanceId === 'A' ? 'primary' : 'warning'" effect="dark">
      当前 content：实例 {{ instanceId }}
    </ElTag>
    <p v-if="note" class="panel__note">{{ note }}</p>
    <p class="panel__hint">
      点击下方「触发 action」会向页面事件日志写入一条记录，用于确认弹层是否仍在 DOM 中响应。
    </p>
    <ElButton type="primary" plain @click="onActionClick">
      触发 action（实例 {{ instanceId }}）
    </ElButton>
  </div>

  <LayerTemplate name="footer">
    <ElButton v-if="instanceId === 'A' && onOpenB" type="warning" @click="onOpenB">
      从 A 打开 B（不关 A）
    </ElButton>
    <ElButton @click="emit('close')">关闭</ElButton>
  </LayerTemplate>
</template>

<style scoped>
.panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.panel__note {
  margin: 0;
  font-size: 13px;
  color: var(--el-text-color-regular);
}

.panel__hint {
  margin: 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 1.5;
}
</style>
