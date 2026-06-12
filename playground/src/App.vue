<script setup lang="ts">
import DemoSection from './components/DemoSection.vue'
import UserList from './components/UserList.vue'
import ClonePanel from './components/panels/ClonePanel.vue'
import ConfigMergePanel from './components/panels/ConfigMergePanel.vue'
import FilterDrawerPanel from './components/panels/FilterDrawerPanel.vue'
import InlineFormPanel from './components/panels/InlineFormPanel.vue'
import ProgrammaticPanel from './components/panels/ProgrammaticPanel.vue'
import UnsavedGuardPanel from './components/panels/UnsavedGuardPanel.vue'

const navItems = [
  { id: 'crud', label: '列表 CRUD' },
  { id: 'inline', label: '页内复用' },
  { id: 'drawer', label: 'Drawer 换层' },
  { id: 'clone', label: 'clone 多实例' },
  { id: 'guard', label: 'beforeClose' },
  { id: 'merge', label: '配置合并' },
  { id: 'api', label: '命令式 API' },
]
</script>

<template>
  <div class="playground">
    <header class="playground-header">
      <div class="playground-header__inner">
        <h1>vue-layerx Playground</h1>
        <p>
          各场景演示 layer + content 分离、<code>show/hide</code>、插槽注入、
          配置合并等能力。弹层均挂载到 <code>document.body</code>。
        </p>
      </div>
    </header>

    <div class="playground-layout">
      <nav class="playground-nav">
        <a
          v-for="item in navItems"
          :key="item.id"
          :href="`#${item.id}`"
          class="playground-nav__link"
        >
          {{ item.label }}
        </a>
      </nav>

      <main class="playground-main">
        <DemoSection
          id="crud"
          title="列表 CRUD — 典型业务弹窗"
          description="UserList 通过 show() 打开 CreateForm；调用方用 LayerSlot 注入 content #header；hideOn 监听 success/cancel 自动关闭。"
          :tags="['show()', 'hideOn', 'content slots', 'useDialog.layer()', 'onSuccess 回调']"
        >
          <UserList />
        </DemoSection>

        <DemoSection
          id="inline"
          title="页内复用 — content 不依赖 layer"
          description="同一 CreateForm 可直接放在页面里。未被 Layer 渲染时 layer() 不激活，LayerSlot 不输出 DOM。"
          :tags="['content 复用', 'layer() 条件激活', 'LayerSlot 静默']"
        >
          <InlineFormPanel />
        </DemoSection>

        <DemoSection
          id="drawer"
          title="Drawer 换层 — 只换 createLayerx"
          description="FilterForm 声明 useDrawer.layer()，业务侧仍用 show()；从 Dialog 切到 Drawer 无需改 content 使用方式。"
          :tags="['useDrawer', 'layer slot → footer', 'hideOn']"
        >
          <FilterDrawerPanel />
        </DemoSection>

        <DemoSection
          id="clone"
          title="clone — 独立实例与默认配置"
          description="从同一基础实例 clone 出宽屏、导出等不同默认 layer 配置，各自维护 visible，可同时存在。"
          :tags="['clone()', '独立 visible', 'layer.props 派生']"
        >
          <ClonePanel />
        </DemoSection>

        <DemoSection
          id="guard"
          title="未保存拦截 — beforeClose"
          description="DraftNote 在 layer() 中配置 beforeClose；点 X / 遮罩关闭时弹出二次确认，校验失败则不 emit hideOn。"
          :tags="['beforeClose', 'layer.props 透传', 'hideOn']"
        >
          <UnsavedGuardPanel />
        </DemoSection>

        <DemoSection
          id="merge"
          title="配置合并 — 四级优先级"
          description="createLayerx（480px）→ layer()（标题）→ useDialog（520px）→ show()（可覆盖标题与 640px）。"
          :tags="['mergeConfig', 'show > useDialog > layer() > createLayerx']"
        >
          <ConfigMergePanel />
        </DemoSection>

        <DemoSection
          id="api"
          title="命令式 API — hide / visible / 工厂默认"
          description="useAlertDialog 在 createLayerx 设 content.props 默认；show() 可覆盖 props、layer、hideOn；外部 hide() 用于倒计时关闭、onUnmounted 卸载清理等场景。"
          :tags="['createLayerx.content.props', 'show.hideOn', 'hide()', 'onUnmounted']"
        >
          <ProgrammaticPanel />
        </DemoSection>
      </main>
    </div>
  </div>
</template>

<style scoped>
.playground {
  min-height: 100vh;
}

.playground-header {
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);
}

.playground-header__inner {
  max-width: 960px;
  margin: 0 auto;
  padding: 28px 24px 24px;
}

.playground-header h1 {
  margin: 0 0 8px;
  font-size: 1.5rem;
}

.playground-header p {
  margin: 0;
  max-width: 720px;
  color: var(--el-text-color-secondary);
  font-size: 14px;
  line-height: 1.6;
}

.playground-header code {
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--el-fill-color-light);
  font-size: 13px;
}

.playground-layout {
  display: grid;
  grid-template-columns: 160px 1fr;
  gap: 32px;
  max-width: 960px;
  margin: 0 auto;
  padding: 24px;
}

.playground-nav {
  position: sticky;
  top: 24px;
  align-self: start;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.playground-nav__link {
  padding: 6px 10px;
  border-radius: 6px;
  color: var(--el-text-color-regular);
  font-size: 13px;
  text-decoration: none;
  transition: background 0.15s;
}

.playground-nav__link:hover {
  background: var(--el-fill-color-light);
  color: var(--el-color-primary);
}

.playground-main {
  display: flex;
  flex-direction: column;
  gap: 40px;
  min-width: 0;
}

@media (max-width: 720px) {
  .playground-layout {
    grid-template-columns: 1fr;
  }

  .playground-nav {
    position: static;
    flex-direction: row;
    flex-wrap: wrap;
  }
}
</style>
