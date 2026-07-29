<script setup lang="ts">
import { ElButton } from 'element-plus'
import { useDialog } from '../../core/layers'
import UserForm from '../02-crud/UserForm.vue'

const mergeDialog = useDialog(UserForm, {
  container: { props: { width: '520px' } },
  closeOn: ['success', 'cancel'],
})

function openDefault() {
  mergeDialog.open({ props: { mode: 'create' } })
}

function openShowOverride() {
  mergeDialog.open({
    props: { mode: 'create' },
    container: {
      props: {
        title: 'open() 覆盖标题',
        width: '640px',
      },
    },
  })
}
</script>

<template>
  <div class="actions">
    <ElButton @click="openDefault">默认（defineLayer 标题 + 520px）</ElButton>
    <ElButton type="primary" @click="openShowOverride">open() 覆盖标题与宽度</ElButton>
  </div>
</template>

<style scoped>
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
