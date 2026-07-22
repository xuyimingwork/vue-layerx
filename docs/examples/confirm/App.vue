<script setup lang="ts">
import { ref } from 'vue'
import { ElButton, ElMessage, ElTag } from 'element-plus'
import { LayerConfirmError } from 'vue-layerx'
import { useDialog } from '../shared/layers'
import MemberPicker from './MemberPicker.vue'
import { members, type Member } from './members'

const selectedIds = ref<string[]>(['1'])
const lastResult = ref('尚未调用 confirm()')

const picker = useDialog(MemberPicker)

const selectedMembers = ref<Member[]>(
  members.filter((m) => selectedIds.value.includes(m.id)),
)

function onInlineUpdate(ids: string[]) {
  selectedIds.value = ids
  selectedMembers.value = members.filter((m) => ids.includes(m.id))
}

async function pickInDialog() {
  try {
    const result = await picker.confirm({
      props: { modelValue: selectedIds.value },
    })
    const picked = (result.data ?? []) as Member[]
    selectedMembers.value = picked
    selectedIds.value = picked.map((m) => m.id)
    lastResult.value = `已选择 ${picked.map((m) => m.name).join('、')}`
    ElMessage.success('已获取弹层结果')
  } catch (e) {
    if (!(e instanceof LayerConfirmError)) throw e
    if (e.code === 'busy') {
      lastResult.value = 'busy：选择器已打开'
      ElMessage.warning('选择器已打开')
      return
    }
    lastResult.value = '已取消 / 关闭'
    ElMessage.info('未选择')
  }
}
</script>

<template>
  <div class="result">
    <span>当前成员：</span>
    <ElTag v-for="m in selectedMembers" :key="m.id" size="small">{{ m.name }}</ElTag>
    <span v-if="!selectedMembers.length" class="empty">（无）</span>
  </div>

  <section class="block">
    <p class="label">同一 MemberPicker · 页内列表</p>
    <MemberPicker :model-value="selectedIds" @update:model-value="onInlineUpdate" />
  </section>

  <ElButton type="primary" @click="pickInDialog">弹层选择 · await confirm()</ElButton>

  <p class="last">
    最近结果：
    <ElTag size="small" type="info">{{ lastResult }}</ElTag>
  </p>
</template>

<style scoped>
.result {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 14px;
}

.empty {
  color: var(--el-text-color-placeholder);
}

.block {
  margin-bottom: 16px;
  padding: 12px 14px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
}

.label {
  margin: 0 0 12px;
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-secondary);
}

.last {
  margin: 12px 0 0;
  font-size: 13px;
  color: var(--el-text-color-regular);
}
</style>
