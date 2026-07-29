/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}

declare module 'element-ui' {
  import type { PluginObject } from 'vue'
  const ElementUI: PluginObject<unknown> & {
    Dialog: import('vue').Component
    Drawer: import('vue').Component
    Message: {
      success: (msg: string) => void
      warning: (msg: string) => void
      info: (msg: string) => void
      error: (msg: string) => void
    }
  }
  export default ElementUI
  export const Dialog: import('vue').Component
  export const Drawer: import('vue').Component
  export const Message: typeof ElementUI.Message
}
