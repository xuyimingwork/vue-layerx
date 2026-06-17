<script setup lang="ts">
import { ref } from 'vue'
import { ElButton, ElSwitch, ElTag } from 'element-plus'
import { detailViewportMobile, useDetailLayer } from '../../../.vitepress/shared/layers'
import UserForm from '../../tutorial/UserForm.vue'

const user = {
  name: 'Alice',
  email: 'alice@example.com',
  role: '管理员',
}

const userLayer = useDetailLayer(UserForm)

function openView() {
  userLayer.show({
    props: { mode: 'view', recordId: 1, initialName: user.name, email: user.email, role: user.role },
  })
}
</script>

<template>
  <p class="hint">
    同一 <code>useDetailLayer(UserForm)</code>，<code>adapt</code> 在窄屏把壳换成 BaseDrawer。
  </p>
  <div class="controls">
    <span>模拟窄屏</span>
    <ElSwitch v-model="detailViewportMobile" />
    <ElTag size="small">{{ detailViewportMobile ? 'Drawer' : 'Dialog' }}</ElTag>
  </div>
  <ElButton type="primary" @click="openView">打开用户详情</ElButton>
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
