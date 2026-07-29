<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElButton, ElDialog, ElDrawer, ElForm, ElFormItem, ElInput } from 'element-plus'
import { defineLayer, LayerTemplate } from 'vue-layerx'

const props = defineProps<{
  initialNote?: string
}>()

const emit = defineEmits<{
  save: [note: string]
}>()

const note = ref(props.initialNote ?? '')
const expanded = ref(false)

watch(
  () => props.initialNote,
  (value) => {
    if (value !== undefined) note.value = value
  },
)

const layer = defineLayer(() => ({
  component: expanded.value ? ElDrawer : ElDialog,
  props: {
    title: expanded.value ? '编辑备注（全屏）' : '编辑备注',
    width: '480px',
    size: '90%',
    direction: 'rtl' as const,
  },
}))

function toggleExpand() {
  expanded.value = !expanded.value
}
</script>

<template>
  <div class="toolbar">
    <ElButton text type="primary" @click="toggleExpand">
      {{ expanded ? '退出全屏' : '全屏展示' }}
    </ElButton>
  </div>

  <ElForm label-position="top">
    <ElFormItem label="备注">
      <ElInput
        v-model="note"
        type="textarea"
        :rows="expanded ? 16 : 4"
        placeholder="写点内容，再点全屏…"
      />
    </ElFormItem>
  </ElForm>

  <LayerTemplate :to="layer" name="footer">
    <ElButton type="primary" @click="emit('save', note)">保存</ElButton>
  </LayerTemplate>
</template>

<style scoped>
.toolbar {
  display: flex;
  justify-content: flex-end;
  margin: -4px 0 8px;
}
</style>
