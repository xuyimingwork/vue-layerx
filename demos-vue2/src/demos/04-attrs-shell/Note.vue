<template>
  <p class="message">
    <code>ShellDialog</code> 只声明了 <code>visible</code> 和 <code>title</code>。
    <code>width</code> 与 <code>customClass</code> 经 <code>$attrs</code> 转到内部
    <code>el-dialog</code>，所以这个弹窗是 360px，并且带蓝色描边。
  </p>
</template>

<style scoped>
.message {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--pg-muted);
}
</style>
