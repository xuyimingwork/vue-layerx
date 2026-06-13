import type { DemoGroup } from './types'

import BasicDemo from './01-basic/index.vue'
import CrudDemo from './02-crud/index.vue'
import InlineReuseDemo from './03-inline-reuse/index.vue'
import DualLayerDemo from './04-dual-layer/index.vue'
import CloneDemo from './05-clone/index.vue'
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
          '最简路径：content 内 useDialog.layer() 声明标题与 footer，调用方 useDialog(Content) + show()，hideOn 自动关闭。',
        tags: ['useDialog', 'show()', 'hideOn', 'useDialog.layer()', 'LayerTemplate'],
        component: BasicDemo,
      },
      {
        id: 'crud',
        level: 2,
        title: '列表 CRUD',
        description:
          '典型业务：show({ props }) 传入动态数据与 onSuccess 回调；调用方 LayerTemplate 注入 content #header。',
        tags: ['show(props)', 'hideOn', 'content slots', 'onSuccess'],
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
          'LayerTemplate visible-outside + scope（inLayer / outsideLayer）：页内 footer 落表单下，弹层时挂 Dialog.footer。',
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
          '同一 FilterContent 同时声明 useDialog.layer() 与 useDrawer.layer()，共用 LayerTemplate；调用方分别 useDialog / useDrawer 打开，仅匹配的 layer() 生效。',
        tags: ['useDialog + useDrawer', '双 layer()', '共用 LayerTemplate', 'hideOn'],
        component: DualLayerDemo,
      },
      {
        id: 'clone',
        level: 5,
        title: 'clone 多实例',
        description:
          '从同一实例 clone 派生不同默认 layer 配置，visible 独立，可并行打开多个弹层。',
        tags: ['clone()', '独立 visible', 'layer.props'],
        component: CloneDemo,
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
          'layer() 配置 beforeClose 透传至 ElDialog；有脏数据时 X / 遮罩关闭需二次确认。',
        tags: ['beforeClose', 'layer.props', 'hideOn'],
        component: BeforeCloseDemo,
      },
      {
        id: 'config-merge',
        level: 7,
        title: '配置合并',
        description:
          '四级优先级：createLayerx → layer() → useDialog → show()。对比默认与 show 覆盖的标题、宽度。',
        tags: ['mergeConfig', 'show > useDialog > layer() > createLayerx'],
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
          'createLayerx.content.props 工厂默认；show 覆盖 props / layer / hideOn；倒计时 hide() 与 onUnmounted 清理。',
        tags: ['createLayerx.content.props', 'show.hideOn', 'hide()', 'onUnmounted'],
        component: LifecycleDemo,
      },
    ],
  },
]
