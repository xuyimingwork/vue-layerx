import type { DemoGroup } from './types'
import BasicDemo from './01-basic/index.vue'
import CrudDemo from './02-crud/index.vue'
import ConfirmDemo from './03-confirm/index.vue'

export const demoGroups: DemoGroup[] = [
  {
    id: 'basics',
    title: 'Element UI · Vue 2.7',
    subtitle: 'model: visible · LayerTemplate · confirm()',
    items: [
      {
        id: 'basic-open',
        title: '三行打开',
        description:
          'createLayer(Dialog, { model: \'visible\' }) — Element UI 不走 Vue 2 默认 value/input。',
        tags: ['createLayer', 'model: visible', 'defineLayer', 'LayerTemplate'],
        component: BasicDemo,
      },
      {
        id: 'crud',
        title: '列表 CRUD',
        description:
          'open({ props }) 传参 + 调用方 LayerTemplate 注入 content #header；footer 由表单投递。',
        tags: ['open(props)', 'closeOn', 'LayerTemplate'],
        component: CrudDemo,
      },
      {
        id: 'confirm',
        title: 'confirm() Promise',
        description:
          'await dialog.confirm()；confirmed: true 的 closeOn 才会 resolve。',
        tags: ['confirm()', 'LayerConfirmError'],
        component: ConfirmDemo,
      },
    ],
  },
]
