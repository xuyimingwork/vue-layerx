<template>
  <el-dialog
    v-bind="$attrs"
    :visible="visible"
    :title="title"
    append-to-body
    v-on="$listeners"
  >
    <slot />
  </el-dialog>
</template>

<script lang="ts">
export default {
  name: 'ShellDialog',
  inheritAttrs: false,
  props: {
    visible: Boolean,
    title: String,
  },
}
</script>
