<script setup lang="ts">
import { computed, inject, unref } from 'vue'
import {
  ElAlert,
  ElButton,
  ElDescriptions,
  ElDescriptionsItem,
  ElPagination,
  ElTag,
  useGlobalConfig,
} from 'element-plus'
import { defineLayer, LayerTemplate } from 'vue-layerx'
import { PLAYGROUND_SCOPE_KEY } from './context'

const emit = defineEmits<{
  close: []
}>()

const scopeSource = inject(PLAYGROUND_SCOPE_KEY, null)
const scope = computed(() => unref(scopeSource))
const epSize = useGlobalConfig('size', 'default')
const epLocale = useGlobalConfig('locale')
const epLocaleName = computed(() => epLocale.value?.name ?? 'unknown')

const layer = defineLayer({
  props: { title: 'Provide / Inject · ConfigProvider' },
})

const customHint = computed(() =>
  scope.value
    ? `自定义 inject：${scope.value.label}`
    : '自定义 inject 未命中',
)

const configHint = computed(() =>
  epSize.value && epSize.value !== 'default'
    ? `ElConfigProvider size = ${epSize.value}`
    : 'ElConfigProvider size = default',
)
</script>

<template>
  <ElAlert :type="scope ? 'success' : 'warning'" :closable="false" show-icon>
    Portal Content inherit Host 的 provide 链（含 ElConfigProvider）。
  </ElAlert>

  <ElDescriptions :column="1" border size="small" class="meta">
    <ElDescriptionsItem label="自定义 provide">
      <ElTag v-if="scope" :type="scope.tagType" effect="dark">{{ scope.label }}</ElTag>
      <span v-else>{{ customHint }}</span>
    </ElDescriptionsItem>
    <ElDescriptionsItem label="useGlobalConfig('size')">
      {{ epSize || 'default' }}
    </ElDescriptionsItem>
    <ElDescriptionsItem label="locale.name">
      {{ epLocaleName }}
    </ElDescriptionsItem>
  </ElDescriptions>

  <p class="demo-note">{{ configHint }} · 下方按钮未设 size，应跟随 ConfigProvider</p>
  <ElButton type="primary">继承 size 的按钮</ElButton>

  <p class="demo-note">Pagination 文案随 locale 变化（共 xx 条 / Total）</p>
  <ElPagination :total="50" :page-size="10" layout="total, prev, pager, next" />

  <LayerTemplate :to="layer" name="footer">
    <ElButton @click="emit('close')">关闭</ElButton>
  </LayerTemplate>
</template>

<style scoped>
.meta {
  margin-top: 12px;
}

.demo-note {
  margin: 14px 0 8px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
</style>
