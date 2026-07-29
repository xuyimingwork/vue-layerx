<script setup lang="ts">
import { createLayer } from 'vue-layerx'
import { Dialog } from 'element-ui'
import HelloContent from './HelloContent.vue'

const useLayer = createLayer(Dialog, { model: 'visible' })
const dialog = useLayer(HelloContent)
</script>

<template>
  <div>
    <pre class="snippet"><code>const useLayer = createLayer(Dialog, { model: 'visible' })
const dialog = useLayer(HelloContent)
dialog.open()</code></pre>

    <el-button type="primary" @click="dialog.open()">dialog.open()</el-button>
  </div>
</template>
