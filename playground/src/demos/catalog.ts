import type { DemoGroup } from './types'

import BasicDemo from './01-basic/index.vue'
import CrudDemo from './02-crud/index.vue'
import InlineReuseDemo from './03-inline-reuse/index.vue'
import DualLayerDemo from './04-dual-layer/index.vue'
import CloneDemo from './05-clone/index.vue'
import CloneParallelDemo from './05-clone-parallel/index.vue'
import BeforeCloseDemo from './06-before-close/index.vue'
import ConfigMergeDemo from './07-config-merge/index.vue'
import LifecycleDemo from './08-lifecycle/index.vue'

export const demoGroups: DemoGroup[] = [
  {
    id: 'basics',
    title: '入门',
    subtitle: 'show / hideOn / 业务传参',
    items: [
      {
        id: 'basic-show',
        level: 1,
        title: '打开与关闭',
        description:
          '最简路径：content 内 defineLayer 声明标题、LayerTemplate name 声明 footer，调用方 useDialog(Content) + show()，hideOn 自动关闭。',
        tags: ['useDialog', 'show()', 'hideOn', 'defineLayer', 'LayerTemplate'],
        component: BasicDemo,
      },
      {
        id: 'crud',
        level: 2,
        title: '列表 CRUD',
        description:
          '典型业务：show({ props }) 传入动态数据与 onSuccess 回调；调用方 LayerTemplate :to 注入 content #header。',
        tags: ['show(props)', 'hideOn', 'LayerTemplate :to', 'onSuccess'],
        component: CrudDemo,
      },
    ],
  },
  {
    id: 'slots-reuse',
    title: '插槽与复用',
    subtitle: '同一 content 多上下文',
    items: [
      {
        id: 'inline-reuse',
        level: 3,
        title: '页内复用',
        description:
          'LayerTemplate visible-outside + scope（inLayer / outsideLayer）：页内 footer 落表单下，弹层时通过 slot render fn 挂到 Dialog.footer。',
        tags: ['visible-outside', 'LayerTemplateScope', 'content 复用'],
        component: InlineReuseDemo,
      },
    ],
  },
  {
    id: 'layer-advanced',
    title: '换层与多实例',
    subtitle: '双容器 / clone',
    items: [
      {
        id: 'dual-layer',
        level: 4,
        title: 'Dialog / Drawer 双容器',
        description:
          '同一 FilterContent 用 defineLayer 写跨容器 props，LayerTemplate name 共用 footer；调用方 useDialog / useDrawer 分工厂打开，各自 adapt 滤 props、对齐 slot。',
        tags: ['useDialog + useDrawer', 'defineLayer', 'adapt', 'hideOn'],
        component: DualLayerDemo,
      },
      {
        id: 'clone',
        level: 5,
        title: 'clone 多实例',
        description:
          '从同一实例 clone({ container }) 派生 clone 默认配置，visible 独立，各实例 show / hide 互不影响。',
        tags: ['clone()', 'clone tier', '独立 visible', 'container.props'],
        component: CloneDemo,
      },
      {
        id: 'clone-parallel',
        level: 5,
        title: 'clone 并行打开',
        description:
          '在 A 已打开时从 A footer 触发打开 B（clone）：每个实例独立 layerRuntime，并行 show 时 visible 与 DOM 一致，hide 互不影响。',
        tags: ['clone()', 'layerRuntime', '并行 show', '独立挂载'],
        component: CloneParallelDemo,
      },
    ],
  },
  {
    id: 'close-config',
    title: '关闭与配置',
    subtitle: '拦截 / 合并优先级',
    items: [
      {
        id: 'before-close',
        level: 6,
        title: '未保存拦截',
        description:
          'defineLayer 配置 beforeClose 透传至 ElDialog；有脏数据时 X / 遮罩关闭需二次确认。',
        tags: ['beforeClose', 'defineLayer', 'container.props', 'hideOn'],
        component: BeforeCloseDemo,
      },
      {
        id: 'config-merge',
        level: 7,
        title: '配置合并',
        description:
          '四级优先级：createLayer(defaults) → defineLayer → useDialog → show()。对比默认与 show 覆盖的标题、宽度。',
        tags: ['mergeLayerConfigStore', 'show > use > define > create'],
        component: ConfigMergeDemo,
      },
    ],
  },
  {
    id: 'lifecycle',
    title: '生命周期',
    subtitle: '工厂默认 / 外部 hide',
    items: [
      {
        id: 'lifecycle-api',
        level: 8,
        title: '工厂默认与卸载清理',
        description:
          'createLayer content.props 工厂默认；show 覆盖 props / layer / hideOn；倒计时 hide() 与 onUnmounted 清理。',
        tags: ['createLayer', 'content.props', 'show.hideOn', 'hide()', 'onUnmounted'],
        component: LifecycleDemo,
      },
    ],
  },
]
