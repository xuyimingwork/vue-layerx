<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  ElButton,
  ElForm,
  ElFormItem,
  ElIcon,
  ElInput,
  ElMessage,
  ElTooltip,
} from 'element-plus'
import { WarningFilled } from '@element-plus/icons-vue'
import { useAsync, useAsyncData } from 'vue-asyncx'
import { defineLayer, LayerTemplate } from 'vue-layerx'
import {
  createUserApi,
  getUserApi,
  updateUserApi,
} from './api'

const props = defineProps<{
  mode?: 'create' | 'edit' | 'view'
  userId?: number
}>()

const emit = defineEmits<{
  createDone: [id: number]
  updateDone: [id: number]
}>()

const mode = computed(
  () => props.mode ?? (props.userId != null ? 'edit' : 'create'),
)

// 定义组件在弹层容器中的表现（响应式）
const layer = defineLayer(() => ({
  props: {
    title:
      mode.value === 'view'
        ? '用户详情'
        : mode.value === 'edit'
          ? '编辑用户'
          : '新增用户',
  },
  content: {
    closeOn: ['createDone', 'updateDone'],
  },
}))

const name = ref('')
const title = ref('')

// 详情获取
const { user, queryUserLoading } = useAsyncData(
  'user',
  () => {
    if (props.userId == null) return
    return getUserApi(props.userId).catch((e) => {
      ElMessage.error(e instanceof Error ? e.message : '加载失败')
      return Promise.reject(e)
    })
  },
  {
    watch: () => props.userId,
    immediate: true,
  },
)

// 数据回填
watch(user, (row) => {
  name.value = row?.name ?? ''
  title.value = row?.title ?? ''
})

// 新增
const { createUser, createUserLoading } = useAsync('createUser', () => {
  if (!validate()) return
  return createUserApi({ name: name.value, title: title.value })
    .then((row) => {
      ElMessage.success('已创建')
      emit('createDone', row.id)
    })
    .catch((e) => {
      ElMessage.error(e instanceof Error ? e.message : '创建失败')
    })
})

// 编辑
const { updateUser, updateUserLoading } = useAsync('updateUser', () => {
  if (props.userId == null || !validate()) return
  return updateUserApi(props.userId, {
    name: name.value,
    title: title.value,
  })
    .then((row) => {
      ElMessage.success('已保存')
      emit('updateDone', row.id)
    })
    .catch((e) => {
      ElMessage.error(e instanceof Error ? e.message : '保存失败')
    })
})

// 保存校验
function validate() {
  if (!name.value.trim()) {
    ElMessage.warning('请填写姓名')
    return false
  }
  return true
}
</script>

<template>
  <ElForm
    v-loading="queryUserLoading"
    :disabled="mode === 'view'"
    label-width="72px"
  >
    <ElFormItem v-if="userId != null" label="ID">
      <span>{{ userId }}</span>
    </ElFormItem>
    <ElFormItem label="姓名">
      <ElInput v-model="name" placeholder="请输入姓名" />
    </ElFormItem>
    <ElFormItem label="职位">
      <ElInput v-model="title" placeholder="请输入职位" />
    </ElFormItem>
  </ElForm>

  <!--
    action 始终投递；view 无主按钮时仍留提示图标，与壳上「取消」并存——内容补充外壳，不覆盖。
  -->
  <LayerTemplate :to="layer" name="action">
    <ElButton
      v-if="mode === 'create'"
      type="primary"
      :loading="createUserLoading"
      @click="createUser"
    >
      新增
    </ElButton>
    <ElButton
      v-else-if="mode === 'edit'"
      type="primary"
      :loading="updateUserLoading"
      @click="updateUser"
    >
      保存
    </ElButton>
    <ElTooltip content="由内容 UserForm 的 LayerTemplate 投递">
      <ElIcon class="action-hint" tabindex="0">
        <WarningFilled />
      </ElIcon>
    </ElTooltip>
  </LayerTemplate>
</template>

<style scoped>
.action-hint {
  margin-right: 6px;
  color: var(--el-color-warning);
  font-size: 16px;
  vertical-align: middle;
  cursor: help;
  outline: none;
}
</style>
