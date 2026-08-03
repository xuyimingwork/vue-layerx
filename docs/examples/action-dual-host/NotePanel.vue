<script setup lang="ts">
import { ElButton, ElInput } from 'element-plus'
import { ref } from 'vue'
import { defineLayer, LayerTemplate } from 'vue-layerx'

const props = defineProps<{
  title?: string
}>()

const emit = defineEmits<{
  preview: [text: string]
  save: [text: string]
}>()

const layer = defineLayer(() => ({
  props: { title: props.title ?? '编辑笔记', width: '420px' },
  // 仅保存关层；预览只 emit，不进 closeOn
  content: { closeOn: ['save'] },
}))

const text = ref('同一套操作区：页内就地，弹层投进 footer。')
</script>

<template>
  <ElInput v-model="text" type="textarea" :rows="3" />

  <!-- 弹层投进 footer；页内因 visible-outside 仍就地渲染。无额外外壳。 -->
  <LayerTemplate :to="layer" name="footer" visible-outside>
    <ElButton @click="emit('preview', text)">预览</ElButton>
    <ElButton type="primary" @click="emit('save', text)">保存</ElButton>
  </LayerTemplate>
</template>
