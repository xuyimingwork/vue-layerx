import { defineComponent, h, type VNode } from 'vue'

/** Vue 2.7 shell: default model is `value` + `input` (aligned with Vue 3 modelValue). */
export const Container = defineComponent({
  name: 'Container',
  model: { prop: 'value', event: 'input' },
  props: {
    value: Boolean,
    title: String,
    width: String,
  },
  setup(props, { slots, emit }) {
    return () =>
      props.value
        ? h(
            'motion-dialog',
            { attrs: { 'data-title': props.title, 'data-width': props.width } },
            [
              slots.default?.(undefined as never),
              slots.footer?.(undefined as never),
              h(
                'button',
                {
                  class: 'close-via-model',
                  on: { click: () => emit('input', false) },
                },
                'close',
              ),
            ],
          )
        : null
  },
})

/** Container that surfaces host inject for bindHost context tests. */
export function makeInjectProbeContainer(key: string, markerClass = 'container-inject') {
  return defineComponent({
    name: 'InjectProbeContainer',
    model: { prop: 'value', event: 'input' },
    props: { value: Boolean },
    inject: {
      probe: { from: key, default: 'missing' },
    },
    render(h) {
      const self = this as unknown as {
        value: boolean
        probe: string
        $slots: { default?: VNode[]; footer?: VNode[] }
      }
      if (!self.value) return null as never
      return h('motion-dialog', {}, [
        h('span', { class: markerClass }, self.probe),
        self.$slots.default,
        self.$slots.footer,
      ])
    },
  })
}

/** Container that surfaces host `$router` for bindHost context tests. */
export function makeRouterProbeContainer(markerClass = 'container-router') {
  return defineComponent({
    name: 'RouterProbeContainer',
    model: { prop: 'value', event: 'input' },
    props: { value: Boolean },
    render(h) {
      const self = this as unknown as {
        value: boolean
        $router?: { currentRoute?: { path?: string } }
        $slots: { default?: VNode[]; footer?: VNode[] }
      }
      if (!self.value) return null as never
      const path = self.$router?.currentRoute?.path ?? 'missing'
      return h('motion-dialog', {}, [
        h('span', { class: markerClass }, path),
        self.$slots.default,
        self.$slots.footer,
      ])
    },
  })
}

export function makeInjectProbeWidget(key: string, markerClass = 'template-inject') {
  return defineComponent({
    name: 'InjectProbeWidget',
    inject: {
      probe: { from: key, default: 'missing' },
    },
    render(h) {
      return h('span', { class: markerClass }, (this as unknown as { probe: string }).probe)
    },
  })
}

export function makeRouterProbeWidget(markerClass = 'template-router') {
  return defineComponent({
    name: 'RouterProbeWidget',
    render(h) {
      const path =
        (this as unknown as { $router?: { currentRoute?: { path?: string } } }).$router
          ?.currentRoute?.path ?? 'missing'
      return h('span', { class: markerClass }, path)
    },
  })
}

/** Custom container model `visible` + `update:visible` (covers non-default toModelUpdateProp). */
export const VisibleModelContainer = defineComponent({
  name: 'VisibleModelContainer',
  model: { prop: 'visible', event: 'update:visible' },
  props: {
    visible: Boolean,
    title: String,
  },
  setup(props, { slots, emit }) {
    return () =>
      props.visible
        ? h(
            'motion-dialog',
            { attrs: { 'data-title': props.title, 'data-model': 'visible' } },
            [
              slots.default?.(undefined as never),
              h(
                'button',
                {
                  class: 'close-via-model',
                  on: { click: () => emit('update:visible', false) },
                },
                'close',
              ),
            ],
          )
        : null
  },
})

export const DrawerContainer = defineComponent({
  name: 'DrawerContainer',
  model: { prop: 'value', event: 'input' },
  props: {
    value: Boolean,
    size: String,
  },
  setup(props, { slots }) {
    return () =>
      props.value
        ? h('motion-drawer', { attrs: { 'data-size': props.size } }, [
            slots.default?.(undefined as never),
          ])
        : null
  },
})

/** Monolith dialog for LayerNoContainer (Vue 2.7 default `value` model). */
export const MonolithDialog = defineComponent({
  name: 'MonolithDialog',
  props: {
    value: Boolean,
    title: String,
    width: String,
    mode: String,
  },
  setup(props, { emit, slots }) {
    return () =>
      props.value
        ? h(
            'motion-monolith',
            {
              attrs: {
                'data-title': props.title,
                'data-width': props.width,
                'data-mode': props.mode,
              },
            },
            [
              slots.default?.(undefined as never),
              h(
                'button',
                {
                  class: 'close-via-model',
                  on: { click: () => emit('input', false) },
                },
                'close',
              ),
            ],
          )
        : null
  },
})

export function makeContent() {
  return defineComponent({
    name: 'Content',
    props: { message: String },
    emits: ['done', 'cancel'],
    setup(props, { emit }) {
      return () =>
        h('motion-div', { class: 'content' }, [
          h('span', { class: 'msg' }, props.message as string),
          h(
            'button',
            { class: 'done', on: { click: () => emit('done') } },
            'done',
          ),
          h(
            'button',
            { class: 'cancel', on: { click: () => emit('cancel') } },
            'cancel',
          ),
        ])
    },
  })
}

/**
 * Inner dialog. Declares fields a shell usually does not, so they must arrive as attrs.
 */
export const InnerElDialog = defineComponent({
  name: 'InnerElDialog',
  props: {
    width: String,
    customClass: String,
  },
  setup(props, { emit, slots }) {
    return () =>
      h(
        'motion-dialog',
        {
          attrs: {
            'data-width': props.width,
            'data-custom-class': props.customClass,
          },
        },
        [
          slots.default?.(undefined as never),
          h(
            'button',
            {
              class: 'emit-opened',
              on: { click: () => emit('opened') },
            },
            'opened',
          ),
        ],
      )
  },
})

/**
 * Shell that declares only `value` and `title`, then forwards the rest
 * the way `v-bind="$attrs"` and `v-on="$listeners"` do.
 * `inheritAttrs: false` so undeclared fields have to come from `$attrs`.
 */
export const ShellDialog = defineComponent({
  name: 'ShellDialog',
  inheritAttrs: false,
  model: { prop: 'value', event: 'input' },
  props: {
    value: Boolean,
    title: String,
  },
  setup(props, ctx) {
    return () =>
      props.value
        ? h(
            InnerElDialog,
            {
              attrs: {
                ...ctx.attrs,
                'data-title': props.title,
              },
              on: ctx.listeners,
            },
            ctx.slots.default?.(undefined as never),
          )
        : null
  },
})

export function queryBodyDialog() {
  return document.body.querySelector('motion-dialog')
}

export function queryBodyMonolith() {
  return document.body.querySelector('motion-monolith')
}
