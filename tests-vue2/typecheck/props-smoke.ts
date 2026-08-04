/**
 * Vue 2.7 smoke: same package `.d.ts` must compile.
 * Does not require Vue-3-level excess-property rejection.
 */
import { defineComponent } from 'vue'
import { createLayer } from 'vue-layerx'
import type { LayerInstance } from 'vue-layerx'

const StubContainer = defineComponent({
  props: {
    title: String,
    width: String,
  },
  render(h: any) {
    return h('div')
  },
})

const StubContent = defineComponent({
  props: {
    mode: String,
    recordId: Number,
  },
  render(h: any) {
    return h('div')
  },
})

const useDialog = createLayer(StubContainer, {
  props: { title: 'Default', width: '520px' },
})

const dialog = useDialog(StubContent, {
  props: { mode: 'edit' },
})

dialog.$open({ mode: 'create', recordId: 2 })
dialog.open({
  props: { mode: 'edit' },
  container: { props: { title: 'Edit' } },
})

const unbound: LayerInstance<Record<string, unknown>, Record<string, unknown>> =
  useDialog()
unbound.$open({ anything: true })

void dialog
void unbound
