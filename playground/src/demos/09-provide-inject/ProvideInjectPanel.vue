<script setup lang="ts">
import { computed, provide, ref } from 'vue'
import { ElAlert, ElButton, ElRadioButton, ElRadioGroup } from 'element-plus'
import { useDialog } from '../../core/layers'
import { PLAYGROUND_SCOPE_KEY, type PlaygroundScope } from './context'
import { moduleScopeDialog } from './module-dialog'
import ScopeContent from './ScopeContent.vue'

type ScopeSource = 'order' | 'dept'
type EpSize = 'large' | 'default' | 'small'
type EpLocaleKey = 'zh-cn' | 'en'

const epSize = defineModel<EpSize>('epSize', { default: 'large' })
const epLocaleKey = defineModel<EpLocaleKey>('epLocaleKey', { default: 'zh-cn' })

const scopeSource = ref<ScopeSource>('order')

const scope = computed<PlaygroundScope>(() =>
  scopeSource.value === 'order'
    ? { label: '订单页', tagType: 'primary' }
    : { label: '部门页', tagType: 'success' },
)

provide(PLAYGROUND_SCOPE_KEY, scope)

const pageDialog = useDialog(ScopeContent, {
  closeOn: ['close'],
})

moduleScopeDialog.bindHost()

function openPageDialog() {
  pageDialog.open()
}

function openModuleDialog() {
  moduleScopeDialog.open()
}
</script>

<template>
  <ElAlert type="info" :closable="false" show-icon class="intro">
    本面板在 <code>ElConfigProvider</code> 子树内 <code>bindHost</code>，弹层 Content 可 inherit
    ConfigProvider 的 size / locale 与自定义 provide。
  </ElAlert>

  <div class="controls">
    <span class="controls__label">ElConfigProvider size</span>
    <ElRadioGroup v-model="epSize" size="small">
      <ElRadioButton value="large">large</ElRadioButton>
      <ElRadioButton value="default">default</ElRadioButton>
      <ElRadioButton value="small">small</ElRadioButton>
    </ElRadioGroup>
  </div>

  <div class="controls">
    <span class="controls__label">ElConfigProvider locale</span>
    <ElRadioGroup v-model="epLocaleKey" size="small">
      <ElRadioButton value="zh-cn">zh-cn</ElRadioButton>
      <ElRadioButton value="en">en</ElRadioButton>
    </ElRadioGroup>
  </div>

  <div class="controls">
    <span class="controls__label">Host provide 上下文</span>
    <ElRadioGroup v-model="scopeSource" size="small">
      <ElRadioButton value="order">订单页</ElRadioButton>
      <ElRadioButton value="dept">部门页</ElRadioButton>
    </ElRadioGroup>
  </div>

  <div class="actions">
    <ElButton type="primary" @click="openPageDialog">
      页面 dialog（setup 内 useLayer，自动 bindHost）
    </ElButton>
    <ElButton @click="openModuleDialog">
      模块单例 dialog（import 后 bindHost）
    </ElButton>
  </div>
</template>

<style scoped>
.intro {
  margin-bottom: 16px;
}

.intro code {
  padding: 1px 4px;
  border-radius: 3px;
  background: var(--el-fill-color-light);
  font-size: 12px;
}

.controls {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}

.controls__label {
  font-size: 14px;
  color: var(--el-text-color-regular);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>
