<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElButton, ElCheckbox, ElCheckboxGroup, ElForm, ElFormItem, ElTag } from 'element-plus'
import { defineLayer, LayerTemplate } from 'vue-layerx'

const props = defineProps<{
  initialStatus?: string[]
}>()

const emit = defineEmits<{
  apply: [status: string[]]
  reset: []
}>()

const status = ref<string[]>([...(props.initialStatus ?? ['active'])])

watch(
  () => props.initialStatus,
  (value) => {
    if (value) status.value = [...value]
  },
)

/** Dialog 用 width，Drawer 用 direction；两套工厂各自 adapt 滤掉无关字段 */
const layer = defineLayer({
  props: {
    title: '筛选条件',
    width: '420px',
    direction: 'rtl',
  },
})

function apply() {
  emit('apply', [...status.value])
}

function reset() {
  status.value = []
  emit('reset')
}
</script>

<template>
  <ElForm label-position="top">
    <ElFormItem label="状态">
      <ElCheckboxGroup v-model="status">
        <ElCheckbox value="active">活跃</ElCheckbox>
        <ElCheckbox value="inactive">停用</ElCheckbox>
        <ElCheckbox value="pending">待审核</ElCheckbox>
      </ElCheckboxGroup>
    </ElFormItem>
  </ElForm>

  <LayerTemplate :to="layer" name="footer" visible-outside>
    <div :class="['footer', { 'footer--inline': !layer.exists }]">
      <ElTag v-if="!layer.exists" size="small" type="info" effect="plain">
        页内 · !layer.exists
      </ElTag>
      <ElTag v-else size="small" type="success" effect="plain">
        弹层 · layer.exists
      </ElTag>
      <ElButton type="primary" @click="apply">应用</ElButton>
      <ElButton @click="reset">重置</ElButton>
    </div>
  </LayerTemplate>
</template>

<style scoped>
.footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.footer--inline {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--el-border-color-lighter);
}
</style>
