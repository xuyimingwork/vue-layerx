<script setup lang="ts">
import { ref } from 'vue'
import { ElButton, ElMessage } from 'element-plus'
import { useEditLayer } from '../../../.vitepress/shared/layers'
import UserForm from '../../tutorial/UserFormWithOutside.vue'

const profile = ref({ name: 'Alice' })

const editLayer = useEditLayer(UserForm)

function onInlineSubmit(name: string) {
  profile.value.name = name
  ElMessage.success('页内保存')
}

function openInDialog() {
  editLayer.show({
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
  <p class="hint">加一行 <code>visible-outside</code>：页内出现保存按钮，弹层仍进 BaseDialog footer。</p>

  <UserForm
    mode="edit"
    :initial-name="profile.name"
    @submit="onInlineSubmit"
  />

  <ElButton class="open-btn" link type="primary" @click="openInDialog">
    弹层编辑对比 →
  </ElButton>
</template>

<style scoped>
.hint {
  margin: 0 0 12px;
  font-size: 13px;
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
