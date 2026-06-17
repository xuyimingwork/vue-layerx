<script setup lang="ts">
import { ref } from 'vue'
import { ElButton, ElSwitch, ElTag } from 'element-plus'
import { detailViewportMobile, useDetailLayer } from '../../../.vitepress/shared/layers'
import UserDetail from '../../tutorial/UserDetail.vue'

const user = {
  name: 'Alice',
  email: 'alice@example.com',
  role: '管理员',
}

const detailLayer = useDetailLayer(UserDetail)

function openDetail() {
  detailLayer.show({ props: user })
}
</script>

<template>
  <p class="hint">
    <code>useDetailLayer</code> 的 <code>adapt</code> 在窄屏把壳从 BaseDialog 换成 BaseDrawer——
    <code>UserDetail</code> 一行不改。
  </p>

  <div class="controls">
    <span>模拟窄屏</span>
    <ElSwitch v-model="detailViewportMobile" />
    <ElTag size="small" type="info">
      {{ detailViewportMobile ? 'Drawer' : 'Dialog（或随浏览器宽度）' }}
    </ElTag>
  </div>

  <ElButton type="primary" @click="openDetail">打开用户详情</ElButton>
</template>

<style scoped>
.hint {
  margin: 0 0 12px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--el-text-color-secondary);
}

.hint code {
  padding: 1px 4px;
  border-radius: 3px;
  background: var(--el-fill-color-light);
  font-size: 12px;
}

.controls {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  font-size: 14px;
}
</style>
