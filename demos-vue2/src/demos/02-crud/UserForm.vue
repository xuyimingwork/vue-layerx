<script setup lang="ts">
import { ref, watch } from 'vue'
import { defineLayer, LayerTemplate } from 'vue-layerx'

const props = defineProps<{
  mode?: 'create' | 'edit'
  recordId?: number
  initialName?: string
}>()

const emit = defineEmits<{
  (e: 'success', name: string): void
  (e: 'cancel'): void
}>()

const name = ref(props.initialName ?? '')

const layer = defineLayer({
  props: {
    title: props.mode === 'edit' ? '编辑用户' : '新建用户',
  },
})

watch(
  () => props.initialName,
  (value) => {
    if (value !== undefined) name.value = value
  },
)

function submit() {
  if (!name.value.trim()) return
  emit('success', name.value.trim())
}
</script>

<template>
  <div>
    <el-form label-width="72px" @submit.native.prevent="submit">
      <el-form-item>
        <slot name="header">
          <span class="form-header">请填写用户信息</span>
        </slot>
      </el-form-item>
      <el-form-item v-if="recordId" label="ID">
        <span>{{ recordId }}</span>
      </el-form-item>
      <el-form-item label="姓名">
        <el-input v-model="name" placeholder="请输入姓名" />
      </el-form-item>
    </el-form>

    <LayerTemplate :to="layer" name="footer">
      <div class="form-footer">
        <el-button type="primary" @click="submit">
          {{ mode === 'edit' ? '保存' : '创建' }}
        </el-button>
        <el-button @click="emit('cancel')">取消</el-button>
      </div>
    </LayerTemplate>
  </div>
</template>

<style scoped>
.form-header {
  font-size: 14px;
  color: var(--pg-muted);
}

.form-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
