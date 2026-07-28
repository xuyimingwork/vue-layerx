<script setup lang="ts">
import { computed, provide, ref } from 'vue'
import { ElButton, ElRadioButton, ElRadioGroup } from 'element-plus'
import { useDialog } from '../shared/layers'
import { DEMO_SCOPE_KEY, type DemoScope } from './context'
import { moduleDialog } from './module-dialog'
import ScopeContent from './ScopeContent.vue'

type EpSize = 'large' | 'default' | 'small'
type ScopeSource = 'order' | 'dept'

const epSize = defineModel<EpSize>('epSize', { required: true })
const scopeSource = ref<ScopeSource>('order')

const scope = computed<DemoScope>(() =>
  scopeSource.value === 'order'
    ? { label: '订单页', tagType: 'primary' }
    : { label: '部门页', tagType: 'success' },
)

provide(DEMO_SCOPE_KEY, scope)

/** 本组件在 ElConfigProvider 子树内：自动 bindHost 才能吃到 size */
const pageDialog = useDialog(ScopeContent, {
  closeOn: ['close'],
})

/** 模块单例：必须在 Provider 子树的 setup 里手动 bindHost */
moduleDialog.bindHost()
</script>

<template>
  <div class="host-demo">
    <p class="hint">
      弹层挂在 portal，默认拿不到页面的 provide。
      <code>ElConfigProvider</code> 须包在 Host 外；本面板在 Provider 子树内
      <code>useDialog</code> / <code>bindHost</code>。
    </p>

    <div class="row">
      <span class="label">ElConfigProvider size</span>
      <ElRadioGroup v-model="epSize" size="small">
        <ElRadioButton value="large">large</ElRadioButton>
        <ElRadioButton value="default">default</ElRadioButton>
        <ElRadioButton value="small">small</ElRadioButton>
      </ElRadioGroup>
    </div>

    <div class="row">
      <span class="label">自定义 provide</span>
      <ElRadioGroup v-model="scopeSource" size="small">
        <ElRadioButton value="order">订单页</ElRadioButton>
        <ElRadioButton value="dept">部门页</ElRadioButton>
      </ElRadioGroup>
    </div>

    <div class="actions">
      <ElButton type="primary" @click="pageDialog.open()">
        页面实例（自动 bindHost）
      </ElButton>
      <ElButton @click="moduleDialog.open()">
        模块单例（已 bindHost）
      </ElButton>
    </div>
  </div>
</template>

<style scoped>
.host-demo {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.hint {
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

.row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.label {
  min-width: 9em;
  font-size: 13px;
  color: var(--vp-c-text-1);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>
