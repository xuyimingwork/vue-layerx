<script setup lang="ts">
import { createLayer } from 'vue-layerx'
import Note from './Note.vue'
import ShellDialog from './ShellDialog.vue'

const useLayer = createLayer(ShellDialog, {
  model: 'visible',
  props: {
    title: '外壳未声明 width',
    width: '360px',
    customClass: 'attrs-shell-dialog',
  },
})
const dialog = useLayer(Note)
</script>

<template>
  <div>
    <pre class="snippet"><code>const useLayer = createLayer(ShellDialog, {
  model: 'visible',
  props: {
    title: '外壳未声明 width',
    width: '360px',
    customClass: 'attrs-shell-dialog',
  },
})</code></pre>

    <el-button type="primary" @click="dialog.open()">打开外壳弹窗</el-button>
  </div>
</template>

<style>
.attrs-shell-dialog {
  border: 2px solid #409eff;
}
</style>
