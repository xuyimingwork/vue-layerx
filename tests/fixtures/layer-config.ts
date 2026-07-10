import { defineComponent, h } from 'vue'
import { defineLayer, type SlotRenderFn } from '@/index'

export const DrawerContainer = defineComponent({
  name: 'DrawerContainer',
  props: { modelValue: Boolean, size: String },
  emits: ['update:modelValue'],
  setup(props, { slots }) {
    return () =>
      props.modelValue
        ? h('motion-drawer', { 'data-size': props.size }, slots.default?.())
        : null
  },
})

export const ModelContainer = defineComponent({
  name: 'ModelContainer',
  props: { modelValue: Boolean, title: String },
  emits: ['update:modelValue'],
  setup(props, { emit, slots }) {
    return () =>
      props.modelValue
        ? h(
            'motion-dialog',
            { 'data-title': props.title },
            [
              slots.default?.(),
              h(
                'button',
                { class: 'close-via-model', onClick: () => emit('update:modelValue', false) },
                'close',
              ),
            ],
          )
        : null
  },
})

const FLEXIBLE_MODEL_KEYS = ['open', 'drawerOpen', 'panelOpen', 'modelValue'] as const

export const FlexibleModelContainer = defineComponent({
  name: 'FlexibleModelContainer',
  props: {
    modelValue: Boolean,
    open: Boolean,
    drawerOpen: Boolean,
    panelOpen: Boolean,
  },
  emits: ['update:modelValue', 'update:open', 'update:drawerOpen', 'update:panelOpen'],
  setup(props, { emit, slots }) {
    return () => {
      const modelKey =
        FLEXIBLE_MODEL_KEYS.find((key) => props[key as keyof typeof props] === true) ??
        'modelValue'
      const active = props[modelKey as keyof typeof props] === true

      return active
        ? h(
            'motion-dialog',
            { 'data-model': modelKey },
            [
              slots.default?.(),
              h(
                'button',
                {
                  class: 'close-via-model',
                  onClick: () => {
                    if (modelKey === 'open') emit('update:open', false)
                    else if (modelKey === 'drawerOpen') emit('update:drawerOpen', false)
                    else if (modelKey === 'panelOpen') emit('update:panelOpen', false)
                    else emit('update:modelValue', false)
                  },
                },
                'close',
              ),
            ],
          )
        : null
    }
  },
})

export const HeaderFooterContainer = defineComponent({
  name: 'HeaderFooterContainer',
  props: { modelValue: Boolean },
  emits: ['update:modelValue'],
  setup(props, { slots }) {
    return () =>
      props.modelValue
        ? h('motion-dialog', {}, [slots.header?.(), slots.default?.(), slots.footer?.()])
        : null
  },
})

export const AltContent = defineComponent({
  name: 'AltContent',
  props: { message: String },
  setup(props) {
    return () => h('motion-div', { class: 'alt-content' }, props.message)
  },
})

export const SlotContent = defineComponent({
  name: 'SlotContent',
  props: { message: String },
  setup(props, { slots }) {
    return () =>
      h('motion-div', { class: 'content' }, [
        h('span', { class: 'msg' }, props.message),
        slots.footer?.(),
        slots.extra?.(),
      ])
  },
})

export const ModeContent = defineComponent({
  name: 'ModeContent',
  props: { message: String, mode: String },
  setup(props) {
    return () =>
      h('motion-div', { class: 'content' }, [
        h('span', { class: 'msg' }, props.message),
        h('span', { class: 'mode' }, props.mode),
      ])
  },
})

export const TieredModeContent = defineComponent({
  name: 'TieredModeContent',
  props: { message: String, mode: String, tone: String, locale: String },
  setup(props) {
    defineLayer({ content: { props: { locale: 'zh' } } })
    return () =>
      h('motion-div', { class: 'content' }, [
        h('span', { class: 'msg' }, props.message),
        h('span', { class: 'mode' }, props.mode),
        h('span', { class: 'tone' }, props.tone),
        h('span', { class: 'locale' }, props.locale),
      ])
  },
})

export const SubmitContent = defineComponent({
  name: 'SubmitContent',
  props: { message: String },
  emits: ['submit', 'done', 'cancel'],
  setup(props, { emit }) {
    return () =>
      h('motion-div', { class: 'content' }, [
        h('span', { class: 'msg' }, props.message),
        h('button', { class: 'submit', onClick: () => emit('submit') }, 'submit'),
        h('button', { class: 'done', onClick: () => emit('done') }, 'done'),
        h('button', { class: 'cancel', onClick: () => emit('cancel') }, 'cancel'),
      ])
  },
})

export const HandlerContent = defineComponent({
  name: 'HandlerContent',
  props: { message: String },
  emits: ['done'],
  setup(props, { emit }) {
    return () =>
      h('motion-div', { class: 'content' }, [
        h('span', { class: 'msg' }, props.message),
        h('button', { class: 'done', onClick: () => emit('done') }, 'done'),
      ])
  },
})

export const DefineUseSlotContent = defineComponent({
  name: 'DefineUseSlotContent',
  props: { message: String },
  setup(props, { slots }) {
    defineLayer({ slots: { footer: slotSpan('define-footer', 'define footer') } })
    return () =>
      h('motion-div', { class: 'content' }, [
        h('span', { class: 'msg' }, props.message),
        slots.extra?.(),
      ])
  },
})

export const RefChainContent = defineComponent({
  name: 'RefChainContent',
  props: { message: String },
  setup(props, { expose }) {
    expose({ marker: 'content' })
    return () => h('span', { class: 'msg' }, props.message)
  },
})

export const CloneMergeContent = defineComponent({
  name: 'CloneMergeContent',
  props: { message: String, mode: String },
  emits: ['done'],
  setup(props, { emit }) {
    return () =>
      h('motion-div', { class: 'content' }, [
        h('span', { class: 'msg' }, props.message),
        h('span', { class: 'mode' }, props.mode),
        h('button', { class: 'done', onClick: () => emit('done') }, 'done'),
      ])
  },
})

export function slotSpan(className: string, text: string): SlotRenderFn {
  return () => h('span', { class: className }, text)
}

export function makeSubmitContentWithDefineLayer(closeOn: string[]) {
  return defineComponent({
    name: 'SubmitDefineContent',
    props: { message: String },
    emits: ['submit', 'done', 'cancel'],
    setup(props, { emit }) {
      defineLayer({ content: { closeOn } })
      return () =>
        h('motion-div', { class: 'content' }, [
          h('span', { class: 'msg' }, props.message),
          h('button', { class: 'submit', onClick: () => emit('submit') }, 'submit'),
          h('button', { class: 'done', onClick: () => emit('done') }, 'done'),
          h('button', { class: 'cancel', onClick: () => emit('cancel') }, 'cancel'),
        ])
    },
  })
}
