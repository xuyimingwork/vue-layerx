<script setup lang="ts">
import {
  computed,
  inject,
  nextTick,
  onMounted,
  ref,
  unref,
  watch,
  type ComponentPublicInstance,
} from 'vue'
import {
  ElAlert,
  ElButton,
  ElDescriptions,
  ElDescriptionsItem,
  ElTag,
  useGlobalConfig,
} from 'element-plus'
import { defineLayer, LayerTemplate } from 'vue-layerx'
import { DEMO_SCOPE_KEY } from './context'

const emit = defineEmits<{
  close: []
}>()

const scopeSource = inject(DEMO_SCOPE_KEY, null)
const scope = computed(() => unref(scopeSource))
const epSize = useGlobalConfig('size', 'default')

const buttonRef = ref<ComponentPublicInstance | null>(null)
const buttonBox = ref('')

async function measureButton() {
  await nextTick()
  const el = buttonRef.value?.$el as HTMLElement | undefined
  if (!el) {
    buttonBox.value = ''
    return
  }
  buttonBox.value = `${el.offsetWidth} × ${el.offsetHeight}`
}

onMounted(measureButton)
watch(epSize, measureButton, { flush: 'post' })

const layer = defineLayer({
  props: { title: '上下文继承', width: '440px' },
  content: { closeOn: ['close'] },
})
</script>

<template>
  <ElAlert :type="scope ? 'success' : 'warning'" :closable="false" show-icon>
    {{
      scope
        ? `自定义 inject：${scope.label}`
        : '自定义 inject 未命中（host 未绑定或绑定位置不对）'
    }}
  </ElAlert>

  <ElDescriptions :column="1" border size="small" class="meta">
    <ElDescriptionsItem label="自定义 provide">
      <ElTag v-if="scope" :type="scope.tagType" effect="dark">{{ scope.label }}</ElTag>
      <span v-else>未命中</span>
    </ElDescriptionsItem>
    <ElDescriptionsItem label="useGlobalConfig('size')">
      {{ epSize || 'default' }}
    </ElDescriptionsItem>
    <ElDescriptionsItem label="按钮实测宽×高">
      {{ buttonBox || '…' }}
    </ElDescriptionsItem>
  </ElDescriptions>

  <p class="hint">下方按钮未设 size，应跟随 ConfigProvider；改外层 size 后重开，宽高数字会变</p>
  <ElButton ref="buttonRef" type="primary">继承 size 的按钮</ElButton>

  <LayerTemplate :to="layer" name="footer">
    <ElButton @click="emit('close')">关闭</ElButton>
  </LayerTemplate>
</template>

<style scoped>
.meta {
  margin-top: 12px;
}

.hint {
  margin: 14px 0 8px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
</style>
