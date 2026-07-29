<script setup lang="ts">
import { ElButton, ElMessage, ElTag } from 'element-plus'
import { defineLayer, LayerConfirmError, LayerTemplate } from 'vue-layerx'
import { useMyDialog } from './layers'
import DownloadConfirm, { type DownloadFormat } from './DownloadConfirm.vue'

const props = defineProps<{
  orderId: string
  customer: string
  amount: string
  onDownloaded?: (message: string) => void
}>()

const layer = defineLayer({
  props: {
    title: `打印预览 · ${props.orderId}`,
    width: '560px',
  },
})

/** 下载能力归属预览：格式确认是预览域内的子组件 */
const downloadConfirm = useMyDialog(DownloadConfirm)

async function mockDownload(format: DownloadFormat) {
  await new Promise((r) => setTimeout(r, 400))
  const message = `已下载 ${props.orderId}.${format}`
  props.onDownloaded?.(message)
  ElMessage.success(`已开始下载 ${props.orderId}.${format}`)
}

async function onDownload() {
  try {
    const result = await downloadConfirm.confirm()
    const format = (result.data as { format: DownloadFormat } | undefined)?.format ?? 'pdf'
    await mockDownload(format)
  } catch (e) {
    if (!(e instanceof LayerConfirmError)) throw e
    if (e.code === 'busy') {
      ElMessage.warning('下载确认已打开')
      return
    }
    props.onDownloaded?.('已取消下载')
    ElMessage.info('已取消下载')
  }
}
</script>

<template>
  <div class="preview">
    <div class="preview__sheet">
      <header class="preview__head">
        <span class="preview__brand">LayerX Orders</span>
        <ElTag size="small" type="info" effect="plain">预览稿</ElTag>
      </header>
      <dl class="preview__meta">
        <div>
          <dt>订单号</dt>
          <dd>{{ orderId }}</dd>
        </div>
        <div>
          <dt>客户</dt>
          <dd>{{ customer }}</dd>
        </div>
        <div>
          <dt>金额</dt>
          <dd>{{ amount }}</dd>
        </div>
      </dl>
      <p class="preview__note">
        下载按钮与格式确认都属于预览域；「关闭」由 MyDialog 提供。
      </p>
    </div>
  </div>

  <LayerTemplate :to="layer" name="actions">
    <ElButton type="primary" @click="onDownload">下载</ElButton>
  </LayerTemplate>
</template>

<style scoped>
.preview {
  margin: -4px 0 0;
}

.preview__sheet {
  padding: 20px 22px;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  background:
    linear-gradient(180deg, var(--el-fill-color-blank) 0%, var(--el-fill-color-lighter) 100%);
  box-shadow: inset 0 1px 0 var(--el-border-color-extra-light);
}

.preview__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px dashed var(--el-border-color);
}

.preview__brand {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--el-text-color-primary);
}

.preview__meta {
  display: grid;
  gap: 10px;
  margin: 0 0 16px;
}

.preview__meta > div {
  display: grid;
  grid-template-columns: 64px 1fr;
  gap: 8px;
  font-size: 13px;
  line-height: 1.5;
}

.preview__meta dt {
  margin: 0;
  color: var(--el-text-color-secondary);
}

.preview__meta dd {
  margin: 0;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.preview__note {
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
  color: var(--el-text-color-secondary);
}
</style>
