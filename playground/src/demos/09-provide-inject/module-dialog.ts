import { useDialog } from '../../core/layers'
import ScopeContent from './ScopeContent.vue'

/** 模块顶 create，无 setup host；需在组件 setup 内 bindHost() 后再 open */
export const moduleScopeDialog = useDialog(ScopeContent, {
  closeOn: ['close'],
})
