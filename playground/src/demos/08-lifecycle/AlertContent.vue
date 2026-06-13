<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElButton } from 'element-plus'
import { LayerTemplate } from 'vue-layerx'
import { useAlertDialog } from '../../core/layers'

const props = withDefaults(
  defineProps<{
    tone?: 'info' | 'success' | 'warning'
    message?: string
  }>(),
  {
    tone: 'info',
    message: '这是一条提示消息',
  },
)

const emit = defineEmits<{
  confirm: []
}>()

const footerRef = ref()

const title = computed(() => {
  const map = { info: '提示', success: '成功', warning: '注意' }
  return map[props.tone]
})

useAlertDialog.layer({
  props: { title: title.value },
  slots: { footer: footerRef },
})
</script>

<template>
  <p :class="['message', `message--${tone}`]">{{ message }}</p>

  <LayerTemplate ref="footerRef">
    <ElButton type="primary" @click="emit('confirm')">知道了</ElButton>
  </LayerTemplate>
</template>

<style scoped>
.message {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
}

.message--info {
  color: var(--el-color-info);
}

.message--success {
  color: var(--el-color-success);
}

.message--warning {
  color: var(--el-color-warning);
}
</style>
