<script setup lang="ts">
import { ref } from 'vue'
import { ElButton, ElMessage } from 'element-plus'
import { useDetailLayer } from '../../../.vitepress/shared/layers'
import UserForm from '../../tutorial/UserFormWithoutOutside.vue'

const profile = ref({ name: 'Alice' })

const userLayer = useDetailLayer(UserForm)

function openInDialog() {
  userLayer.show({
    props: {
      mode: 'edit',
      initialName: profile.value.name,
      onSubmit: (name: string) => {
        profile.value.name = name
        ElMessage.success('弹层保存')
      },
    },
  })
}
</script>

<template>
  <p class="hint">
    设置页想页内改姓名——但 <code>UserForm</code> 的保存按钮只在弹层 footer 里（尚未加
    <code>visible-outside</code>）。
  </p>

  <UserForm mode="edit" :initial-name="profile.name" @submit="() => {}" />

  <ElButton class="open-btn" link type="primary" @click="openInDialog">弹层编辑对比 →</ElButton>
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

.open-btn {
  margin-top: 8px;
}
</style>
