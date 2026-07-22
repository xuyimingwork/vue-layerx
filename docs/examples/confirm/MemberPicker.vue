<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElButton, ElCheckbox, ElCheckboxGroup } from 'element-plus'
import { defineLayer, LayerTemplate } from 'vue-layerx'
import { members, type Member } from './members'

const props = defineProps<{
  modelValue?: string[]
}>()

const emit = defineEmits<{
  'update:modelValue': [ids: string[]]
  confirm: [selected: Member[]]
  cancel: []
}>()

const selected = ref<string[]>([...(props.modelValue ?? [])])

watch(
  () => props.modelValue,
  (value) => {
    selected.value = [...(value ?? [])]
  },
)

const layer = defineLayer({
  props: {
    title: '选择成员',
    width: '420px',
  },
  content: {
    closeOn: {
      confirm: { when: 'always', confirmed: true },
      cancel: { when: 'always', confirmed: false },
    },
  },
})

function onSelect(ids: string[]) {
  selected.value = ids
  if (!layer.exists) {
    emit('update:modelValue', [...ids])
  }
}

function confirm() {
  emit(
    'confirm',
    members.filter((m) => selected.value.includes(m.id)),
  )
}

function cancel() {
  emit('cancel')
}
</script>

<template>
  <p class="hint">
    {{ layer.exists ? '弹层内勾选，确定后带回结果' : '页内列表，勾选即更新' }}
  </p>

  <ElCheckboxGroup :model-value="selected" @update:model-value="onSelect">
    <div v-for="m in members" :key="m.id" class="row">
      <ElCheckbox :value="m.id">
        {{ m.name }}
        <span class="role">· {{ m.role }}</span>
      </ElCheckbox>
    </div>
  </ElCheckboxGroup>

  <LayerTemplate v-if="layer.exists" :to="layer" name="footer">
    <ElButton @click="cancel">取消</ElButton>
    <ElButton type="primary" :disabled="!selected.length" @click="confirm">
      确定（{{ selected.length }}）
    </ElButton>
  </LayerTemplate>
</template>

<style scoped>
.hint {
  margin: 0 0 12px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.row {
  margin-bottom: 4px;
}

.role {
  color: var(--el-text-color-secondary);
  font-weight: 400;
}
</style>
