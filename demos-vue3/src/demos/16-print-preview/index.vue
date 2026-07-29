<script setup lang="ts">
import { ref } from 'vue'
import { ElButton, ElTable, ElTableColumn, ElTag } from 'element-plus'
import { useMyDialog } from './layers'
import OrderDetail from './OrderDetail.vue'

interface Order {
  id: string
  customer: string
  amount: string
  status: string
  createdAt: string
}

const orders: Order[] = [
  {
    id: 'ORD-2026-0718',
    customer: 'Acme Studio',
    amount: '¥2,480.00',
    status: '已支付',
    createdAt: '2026-07-18 14:32',
  },
  {
    id: 'ORD-2026-0720',
    customer: 'Northwind',
    amount: '¥860.00',
    status: '待发货',
    createdAt: '2026-07-20 09:15',
  },
  {
    id: 'ORD-2026-0725',
    customer: 'Blue Harbor',
    amount: '¥5,120.00',
    status: '已完成',
    createdAt: '2026-07-25 16:48',
  },
]

const last = ref('尚未操作')

/** 列表页只负责打开详情弹层 */
const detail = useMyDialog(OrderDetail)

function openDetail(row: Order) {
  detail.open({
    props: {
      orderId: row.id,
      customer: row.customer,
      amount: row.amount,
      status: row.status,
      createdAt: row.createdAt,
      onDownloaded: (message: string) => {
        last.value = message
      },
    },
  })
}
</script>

<template>
  <div class="print-preview-demo">
    <p class="intro">
      本 demo 用
      <code>MyDialog</code>
      包一层
      <code>ElDialog</code>：「关闭」在壳内，业务按钮走
      <code>LayerTemplate name="actions"</code>。
      列表
      <code>open(OrderDetail)</code>
      → 详情
      <code>open(PrintPreview)</code>
      → 下载归预览（含
      <code>DownloadConfirm</code>）。
    </p>

    <ol class="steps">
      <li>列表点「详情」→ 打开详情弹窗（MyDialog）。</li>
      <li>详情里点「打印预览」→ 再叠一层预览。</li>
      <li>预览里点「下载」→ 预览自己开格式确认并模拟下载。</li>
    </ol>

    <ElTable :data="orders" stripe>
      <ElTableColumn prop="id" label="订单号" min-width="140" />
      <ElTableColumn prop="customer" label="客户" min-width="110" />
      <ElTableColumn prop="amount" label="金额" width="100" />
      <ElTableColumn prop="status" label="状态" width="90" />
      <ElTableColumn label="操作" width="100" fixed="right">
        <template #default="{ row }">
          <ElButton link type="primary" @click="openDetail(row)">详情</ElButton>
        </template>
      </ElTableColumn>
    </ElTable>

    <p class="last">
      最近结果：
      <ElTag size="small" type="info">{{ last }}</ElTag>
    </p>
  </div>
</template>

<style scoped>
.intro {
  margin: 0 0 12px;
  font-size: 13px;
  line-height: 1.65;
  color: var(--el-text-color-secondary);
}

.intro code {
  padding: 1px 4px;
  border-radius: 3px;
  background: var(--el-fill-color-light);
  font-size: 12px;
}

.steps {
  margin: 0 0 16px;
  padding-left: 1.25rem;
  font-size: 13px;
  line-height: 1.7;
  color: var(--el-text-color-regular);
}

.last {
  margin: 12px 0 0;
  font-size: 13px;
  color: var(--el-text-color-regular);
}
</style>
