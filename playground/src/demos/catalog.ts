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
import ProvideInjectDemo from './09-provide-inject/index.vue'
import LayerNoContainerDemo from './10-layer-no-container/index.vue'

export const demoGroups: DemoGroup[] = [
  {
    id: 'basics',
    title: '入门',
    subtitle: 'open / closeOn / 业务传参',
    items: [
      {
        id: 'basic-open',
        level: 1,
        title: '三行打开',
        description:
          '调用方仅 createLayer(Container) + useLayer(Content) + open()，全部默认参数；标题、closeOn、footer 由 content 内 defineLayer / LayerTemplate 声明。',
        tags: ['createLayer', 'useLayer', 'open()', 'defineLayer', 'LayerTemplate'],
        component: BasicDemo,
      },
      {
        id: 'crud',
        level: 2,
        title: '列表 CRUD',
        description:
          '典型业务：open({ props }) 传入动态数据与 onSuccess 回调；调用方 LayerTemplate :to 注入 content #header。',
        tags: ['open(props)', 'closeOn', 'LayerTemplate :to', 'onSuccess'],
        component: CrudDemo,
      },
      {
        id: 'layer-no-container',
        level: 2,
        title: 'LayerNoContainer 存量单体',
        description:
          '同一 useLayer：adapter 对内嵌 Dialog 的 content 换成 LayerNoContainer 拍平；UserForm 仍走 ElDialog。也可 createLayer(LayerNoContainer)。',
        tags: ['LayerNoContainer', 'adapter', '渐进接入'],
        component: LayerNoContainerDemo,
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
        tags: ['useDialog + useDrawer', 'defineLayer', 'adapt', 'closeOn'],
        component: DualLayerDemo,
      },
      {
        id: 'clone',
        level: 5,
        title: 'clone 多实例',
        description:
          '从同一实例 clone({ container }) 派生 clone 默认配置，visible 独立，各实例 open / close 互不影响。',
        tags: ['clone()', 'clone tier', '独立 visible', 'container.props'],
        component: CloneDemo,
      },
      {
        id: 'clone-parallel',
        level: 5,
        title: 'clone 并行打开',
        description:
          '在 A 已打开时从 A footer 触发打开 B（clone）：每个实例独立 layerRuntime，并行 open 时 visible 与 DOM 一致，close 互不影响。',
        tags: ['clone()', 'layerRuntime', '并行 open', '独立挂载'],
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
        tags: ['beforeClose', 'defineLayer', 'container.props', 'closeOn'],
        component: BeforeCloseDemo,
      },
      {
        id: 'config-merge',
        level: 7,
        title: '配置合并',
        description:
          '四级优先级：createLayer(defaults) → defineLayer → useDialog → open()。对比默认与 open 覆盖的标题、宽度。',
        tags: ['mergeFragment', 'open > use > define > create'],
        component: ConfigMergeDemo,
      },
    ],
  },
  {
    id: 'lifecycle',
    title: '生命周期',
    subtitle: '工厂默认 / 外部 close',
    items: [
      {
        id: 'lifecycle-api',
        level: 8,
        title: '工厂默认与卸载清理',
        description:
          'createLayer content.props 工厂默认；open 覆盖 props / container / closeOn；倒计时 close() 与 onUnmounted 清理。',
        tags: ['createLayer', 'content.props', 'open.closeOn', 'close()', 'onUnmounted'],
        component: LifecycleDemo,
      },
    ],
  },
  {
    id: 'context',
    title: 'Host 上下文',
    subtitle: 'provide / inject · bindHost',
    items: [
      {
        id: 'provide-inject',
        level: 9,
        title: 'Provide / Inject · ConfigProvider',
        description:
          'ElConfigProvider 须在 bindHost 组件的祖先；Content inherit size / locale 与自定义 provide。模块单例同样需在 Provider 子树内 bindHost()。',
        tags: ['provide', 'inject', 'bindHost', 'ElConfigProvider', 'useGlobalConfig'],
        component: ProvideInjectDemo,
      },
    ],
  },
]
