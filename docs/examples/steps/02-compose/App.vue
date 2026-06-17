<script setup>
import OrderDetail from '../../tutorial/OrderDetail.vue'
</script>

<template>
  <p class="hint">
    同一个 <code>UserDetail.vue</code>——纯展示，无编辑、无 footer 按钮。
    在订单页就是普通组件；在列表页通过 <code>useDetailLayer</code> 弹层展示。
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
