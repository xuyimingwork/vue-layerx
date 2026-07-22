<script setup lang="ts">
import { ElButton } from 'element-plus'
import { defineLayer, LayerTemplate } from 'vue-layerx'

const emit = defineEmits<{
  ok: []
}>()

const layer = defineLayer({
  props: { title: '内容里填 footer', width: '420px' },
  content: { closeOn: ['ok'] },
})
</script>

<template>
  <p class="body">
    默认插槽是正文；下方
    <code>LayerTemplate</code>
    投到容器的
    <code>#footer</code>
    。页面还可往内容的
    <code>#header</code>
    再投一块。
  </p>

  <slot name="header" />

  <LayerTemplate :to="layer" name="footer">
    <ElButton type="primary" @click="emit('ok')">确定</ElButton>
  </LayerTemplate>
</template>

<style scoped>
.body {
  margin: 0 0 12px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--el-text-color-regular);
}

.body code {
  padding: 1px 4px;
  border-radius: 3px;
  background: var(--el-fill-color-light);
  font-size: 12px;
}
</style>
