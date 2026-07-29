<script setup lang="ts">
import { ElButton, ElDialog, ElTag } from 'element-plus'
import { ref } from 'vue'
import { createLayer } from 'vue-layerx'
import UserDialog from './UserDialog.vue'
import UserForm from './UserForm.vue'

/** 普通工厂，没有 adapter；单体靠 content 内 defineLayer 换壳。 */
const useLayer = createLayer(ElDialog, {
  props: {
    width: '480px',
    destroyOnClose: true,
    appendToBody: true,
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
      title: 'defineLayer → LayerNoContainer',
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
  <pre class="snippet"><code>// UserDialog.vue（壳+表单未拆）
defineLayer({ component: LayerNoContainer })

// 调用方：普通工厂，无 adapter
const useLayer = createLayer(ElDialog)
useLayer(UserDialog) // define 后同构换壳
useLayer(UserForm)   // 仍走 ElDialog</code></pre>

  <p class="hint">
    对比
    <a class="link" href="#layer-no-container">adapter 方案</a>：这里由单体
    <code>defineLayer({ component: LayerNoContainer })</code>
    自报「不要外层 Dialog」。与真壳同 Teleport 树，换壳可 park、不必 remount；首帧仍可能短暂先走
    <code>ElDialog</code>。拆成
    <code>UserForm</code> 后删掉那行即可。
  </p>

  <div class="actions">
    <ElButton type="primary" @click="openMonolith">打开单体（defineLayer 换壳）</ElButton>
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

.hint .link {
  color: var(--el-color-primary);
  text-decoration: none;
}

.hint .link:hover {
  text-decoration: underline;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}
</style>
