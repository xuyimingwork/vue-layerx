import { useDialog } from '../shared/layers'
import ScopeContent from './ScopeContent.vue'

/** 模块顶层创建：无 setup host，须在 Provider 子树内 bindHost() */
export const moduleDialog = useDialog(ScopeContent, {
  closeOn: ['close'],
})
