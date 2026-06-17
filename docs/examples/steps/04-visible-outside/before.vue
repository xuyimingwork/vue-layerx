<script setup lang="ts">
import { ref } from 'vue'
import { ElButton, ElMessage } from 'element-plus'
import { useEditLayer } from '../../../.vitepress/shared/layers'
import UserForm from '../../tutorial/UserForm.vue'

const profile = ref({ name: 'Alice' })

const editLayer = useEditLayer(UserForm)

function openInDialog() {
  editLayer.show({
    props: {
      mode: 'edit',
      initialName: profile.value.name,
      onSubmit: (name: string) => {
        profile.value.name = name
        ElMessage.success('已保存')
      },
    },
  })
}
</script>

<template>
  <p class="hint">
    设置页想<strong>页内直接改姓名</strong>，但 <code>UserForm</code> 的保存按钮只在弹层 footer 里——看不见。
    加 <code>visible-outside</code> 即可。
  </p>

  <div class="profile-card">
    <p class="label">姓名</p>
    <p class="value">{{ profile.name }}</p>
    <ElButton link type="primary" @click="openInDialog">弹层编辑</ElButton>
  </div>

  <p class="todo">↓ 下一节给 UserForm 加上 visible-outside 后，这里会出现保存按钮</p>
</template>

<style scoped>
.hint {
  margin: 0 0 16px;
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

.profile-card {
  padding: 12px 16px;
  border-radius: 8px;
  background: var(--el-fill-color-light);
}

.label {
  margin: 0 0 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.value {
  margin: 0 0 8px;
  font-size: 16px;
}

.todo {
  margin: 16px 0 0;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}
</style>
