<script setup lang="ts">
import { ElButton, ElDialog, ElTag } from 'element-plus'
import { ref, type Component } from 'vue'
import { createLayer, LayerNoContainer } from 'vue-layerx'
import UserDialog from './UserDialog.vue'
import UserForm from './UserForm.vue'

function withDialog(component?: Component) {
  return component === UserDialog
}

/** One factory for both monolith UserDialog and split UserForm. */
const useLayer = createLayer(ElDialog, {
  props: {
    width: '480px',
    destroyOnClose: true,
    appendToBody: true,
  },
  adapter: (fragment) => {
    if (withDialog(fragment.content?.component)) {
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
  <pre class="snippet"><code>const useLayer = createLayer(ElDialog, {
  adapter: (f) =>
    withDialog(f.content?.component)
      ? { ...f, container: { ...f.container, component: LayerNoContainer } }
      : f,
})
useLayer(UserDialog) // 单体：拍平
useLayer(UserForm)   // 拆分：ElDialog 壳</code></pre>

  <p class="hint">
    同一 <code>useLayer</code>：adapter 识别内嵌 Dialog 的 content 后换成
    <code>LayerNoContainer</code>；普通 Form 仍走 <code>ElDialog</code>。
  </p>

  <div class="actions">
    <ElButton type="primary" @click="openMonolith">打开单体 UserDialog</ElButton>
    <ElButton @click="openForm">打开拆分 UserForm</ElButton>
    <ElTag v-if="last" type="success" effect="plain">{{ last }}</ElTag>
  </div>
</template>

<style scoped>
.snippet {
  margin: 0 0 12px;
  padding: 12px 14px;
  border-radius: 6px;
  background: var(--el-fill-color-light);
  font-size: 13px;
  line-height: 1.6;
  overflow-x: auto;
}

.snippet code,
.hint code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.hint {
  margin: 0 0 16px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  line-height: 1.6;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}
</style>
