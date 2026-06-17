<script setup lang="ts">
import { ref } from 'vue'
import { ElCard, ElTag } from 'element-plus'
import UserForm from './UserForm.vue'

const order = ref({
  id: 'ORD-1024',
  userName: 'Alice',
  email: 'alice@example.com',
  role: '管理员',
  amount: 1280,
})
</script>

<template>
  <ElCard shadow="never" class="order-detail">
    <template #header>
      <div class="order-detail__head">
        <span>订单 {{ order.id }}</span>
        <ElTag size="small">已支付</ElTag>
      </div>
    </template>

    <p class="order-detail__amount">金额：¥{{ order.amount }}</p>

    <section class="order-detail__section">
      <h4>收货人</h4>
      <UserForm
        mode="view"
        :initial-name="order.userName"
        :email="order.email"
        :role="order.role"
      />
    </section>
  </ElCard>
</template>

<style scoped>
.order-detail__head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.order-detail__amount {
  margin: 0 0 16px;
  font-size: 14px;
}

.order-detail__section h4 {
  margin: 0 0 12px;
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
}
</style>
