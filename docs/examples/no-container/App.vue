<script setup lang="ts">
import { ElButton, ElDialog, ElTag } from 'element-plus'
import { createLayer, LayerNoContainer } from 'vue-layerx'
import MonolithDefine from './MonolithDefine.vue'
import MonolithFactory from './MonolithFactory.vue'
import { definePathSetupCount, factoryPathSetupCount } from './stats'

/** A：工厂仍是 ElDialog，内容里 defineLayer 换成 LayerNoContainer */
const useDialog = createLayer(ElDialog, {
  props: {
    width: '480px',
    destroyOnClose: true,
    appendToBody: true,
  },
})

/** B：工厂直接是 LayerNoContainer，打开前就定好容器 */
const useNoContainer = createLayer(LayerNoContainer, {
  props: {
    width: '480px',
  },
})

const viaDefine = useDialog(MonolithDefine)
const viaFactory = useNoContainer(MonolithFactory, { closeOn: ['success'] })

function openDefine() {
  viaDefine.open({
    props: {
      mode: 'edit',
      initialName: 'Ada',
      title: 'defineLayer 自报',
    },
  })
}

function openFactory() {
  viaFactory.open({
    props: {
      mode: 'edit',
      initialName: 'Ada',
      title: 'createLayer(LayerNoContainer)',
    },
  })
}
</script>

<template>
  <div class="no-container-demo">
    <p class="no-container-demo__hint">
      对比两种定容器时机。下方「内容 setup 次数」在每次内容挂载时 +1；同构换容器后两者通常都是每次打开 +1。观感上弹窗一般无差。
    </p>
    <div class="no-container-demo__actions">
      <ElButton type="primary" @click="openDefine">
        A · defineLayer 自报（推荐）
      </ElButton>
      <ElButton @click="openFactory">
        B · createLayer(LayerNoContainer)
      </ElButton>
    </div>
    <div class="no-container-demo__stats">
      <ElTag effect="plain">A setup：{{ definePathSetupCount }}</ElTag>
      <ElTag effect="plain" type="info">B setup：{{ factoryPathSetupCount }}</ElTag>
    </div>
  </div>
</template>

<style scoped>
.no-container-demo__hint {
  margin: 0 0 12px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}

.no-container-demo__actions,
.no-container-demo__stats {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.no-container-demo__stats {
  margin-top: 12px;
}
</style>
