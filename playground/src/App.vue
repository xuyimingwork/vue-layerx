<script setup lang="ts">
import UserList from './components/UserList.vue'
</script>

<template>
  <main class="app">
    <p class="hint">
      vue-layerx playground · 点击「新建用户」走 <code>CreateUserDialog.show()</code>，
      编辑走带 payload 的 <code>show()</code>
    </p>
    <UserList />
  </main>
</template>

<style scoped>
.app {
  padding: 32px 24px;
}

.hint {
  max-width: 640px;
  margin: 0 auto 24px;
  color: var(--el-text-color-secondary);
  font-size: 14px;
  line-height: 1.6;
}

.hint code {
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--el-fill-color-light);
  font-size: 13px;
}
</style>
