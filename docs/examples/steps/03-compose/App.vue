<script setup>
import OrderDetail from '../../tutorial/OrderDetail.vue'
</script>

<template>
  <p class="hint">
    同一个 <code>UserForm.vue</code>——没有 Dialog 字样，直接嵌在订单详情里。
    <code>defineLayer</code> 在弹层时生效，页内使用时只是普通表单。
  </p>
  <OrderDetail />
</template>

<style scoped>
.hint {
  margin: 0 0 16px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--el-text-color-secondary);
}

.hint code {
  padding: 1px 4px;
  border-radius: 3px;
  background: var(--el-fill-color-light);
  font-size: 12px;
}
</style>
