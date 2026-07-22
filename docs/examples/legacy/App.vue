<script setup lang="ts">
import { ElButton, ElDialog, ElTag } from 'element-plus'
import { ref, type Component } from 'vue'
import { createLayer, LayerNoContainer } from 'vue-layerx'
import UserDialog from './UserDialog.vue'
import UserForm from './UserForm.vue'

function isMonolith(component?: Component) {
  return component === UserDialog
}

/** 同一工厂：单体走 LayerNoContainer，已拆分走 ElDialog */
const useLayer = createLayer(ElDialog, {
  props: {
    width: '480px',
    destroyOnClose: true,
    appendToBody: true,
  },
  adapter: (fragment) => {
    if (isMonolith(fragment.content?.component)) {
      return {
        ...fragment,
        container: {
          ...fragment.container,
          component: LayerNoContainer,
        },
      }
    }
    return fragment
  },
})

const last = ref('')
const monolith = useLayer(UserDialog, { closeOn: ['success'] })
const form = useLayer(UserForm)

function openMonolith() {
  monolith.open({
    props: {
      mode: 'edit',
      initialName: 'Ada',
      title: '单体 UserDialog',
      onSuccess: (name: string) => {
        last.value = `monolith: ${name}`
      },
    },
  })
}

function openForm() {
  form.open({
    props: {
      mode: 'create',
      initialName: '',
      onSuccess: (name: string) => {
        last.value = `form: ${name}`
      },
    },
  })
}
</script>

<template>
  <div class="legacy">
    <div class="legacy__actions">
      <ElButton type="primary" @click="openMonolith">打开单体 UserDialog</ElButton>
      <ElButton @click="openForm">打开拆分 UserForm</ElButton>
      <ElTag v-if="last" type="success" effect="plain">{{ last }}</ElTag>
    </div>
  </div>
</template>

<style scoped>
.legacy__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}
</style>
