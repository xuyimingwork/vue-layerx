<script setup lang="ts">
import { ref } from 'vue'
import { ElButton, ElDialog, ElDrawer, ElTag } from 'element-plus'
import { createLayer } from 'vue-layerx'
import PanelContent from './PanelContent.vue'

function stripProps(props: Record<string, unknown> | undefined, ...keys: string[]) {
  return Object.fromEntries(
    Object.entries(props ?? {}).filter(([key]) => !keys.includes(key)),
  )
}

/**
 * defineLayer 负责换 component；adapter 只按最终壳滤 props / 对齐 slot。
 */
const useLayer = createLayer(ElDialog, {
  props: {
    width: '480px',
    destroyOnClose: true,
    appendToBody: true,
  },
  adapter: (fragment) => {
    const container = fragment.container ?? {}

    if (container.component !== ElDrawer) {
      return {
        ...fragment,
        container: {
          ...container,
          props: stripProps(container.props, 'size', 'direction'),
        },
      }
    }

    const slots = container.slots ?? {}
    const { title, footer, ...rest } = slots
    return {
      ...fragment,
      container: {
        ...container,
        props: stripProps(container.props, 'width'),
        slots: {
          ...rest,
          ...('title' in slots ? { header: title } : {}),
          ...('footer' in slots ? { footer } : {}),
        },
      },
    }
  },
})

const last = ref('')
const panel = useLayer(PanelContent, { closeOn: ['save'] })

function open() {
  panel.open({
    props: {
      initialNote: last.value || '先改几行字，再点内容里的「全屏展示」',
      onSave: (value: string) => {
        last.value = value
      },
    },
  })
}
</script>

<template>
  <pre class="snippet"><code>// PanelContent
const expanded = ref(false)
defineLayer(() => ({
  component: expanded.value ? ElDrawer : ElDialog,
  props: { title, width, size, direction },
})

// 工厂 adapter 只按最终 component 滤 props / 对齐 slot</code></pre>

  <p class="hint">
    全屏态与草稿都在 content 内：
    <code>defineLayer(() => ({ component }))</code>
    换壳；工厂
    <code>adapter</code>
    只做 Dialog / Drawer 差异适配。
  </p>

  <div class="actions">
    <ElButton type="primary" @click="open">打开编辑</ElButton>
    <ElTag v-if="last" type="success" effect="plain">上次保存：{{ last }}</ElTag>
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
