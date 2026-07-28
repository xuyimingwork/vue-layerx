<script setup lang="ts">
import { ref, type Component } from 'vue'
import { ElButton, ElRadioButton, ElRadioGroup } from 'element-plus'
import { useDialog } from '../shared/layers'
import ProfileForm from './ProfileForm.vue'
import NoteForm from './NoteForm.vue'

const options: { label: string; component: Component }[] = [
  { label: '资料表单', component: ProfileForm },
  { label: '备忘表单', component: NoteForm },
]

const selected = ref(options[0]!.label)
const layer = useDialog()

function openSelected() {
  const hit = options.find((o) => o.label === selected.value)!
  layer.open({
    component: hit.component,
  })
}
</script>

<template>
  <div class="dynamic-demo">
    <p class="hint">
      实例创建时不绑内容；打开时再传入 <code>component</code>。选一个再点打开。
    </p>
    <ElRadioGroup v-model="selected" size="small">
      <ElRadioButton v-for="o in options" :key="o.label" :value="o.label">
        {{ o.label }}
      </ElRadioButton>
    </ElRadioGroup>
    <ElButton type="primary" @click="openSelected">打开</ElButton>
  </div>
</template>

<style scoped>
.dynamic-demo {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.hint {
  flex: 1 1 100%;
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}

.hint code {
  padding: 1px 4px;
  border-radius: 3px;
  background: var(--vp-c-bg-soft);
  font-size: 12px;
}
</style>
