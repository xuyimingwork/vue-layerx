import { defineComponent, h, onMounted } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import {
  createLayer,
  defineLayer,
  LayerTemplate,
  type LayerConfigInstance,
  type LayerInstance,
} from '@/index'
import { flushPromises } from '@tests/helpers/dom'
import {
  Container,
  makeContent,
  makeContentWithDefineLayer,
  queryBodyDialog,
} from '@tests/fixtures/components'

// ── Fixed probe value per tier (merge winner = its marker appears in DOM) ──
// Props chain: open > use (= clone folded) > define > create
// Slot chain: open > use > use:template > define > define:template > create

const TIER = {
  create: 'from-create',
  define: 'from-define',
  use: 'from-use',
  open: 'from-open',
  'use-template': 'from-use-template',
  'define-template': 'from-define-template',
} as const

type PropsTier = 'create' | 'define' | 'use' | 'open'
type SlotTier = 'use' | 'use-template' | 'define' | 'define-template'

/** MECE matrix: which tiers are configured → which tier must win. */
const PROPS_MERGE_CASES: { label: string; active: PropsTier[]; expected: PropsTier }[] = [
  { label: 'all tiers', active: ['create', 'define', 'use', 'open'], expected: 'open' },
  { label: 'missing open', active: ['create', 'define', 'use'], expected: 'use' },
  { label: 'missing use', active: ['create', 'define', 'open'], expected: 'open' },
  { label: 'missing define', active: ['create', 'use', 'open'], expected: 'open' },
  { label: 'missing create', active: ['define', 'use', 'open'], expected: 'open' },
  { label: 'missing open, use', active: ['create', 'define'], expected: 'define' },
  { label: 'missing open, define', active: ['create', 'use'], expected: 'use' },
  { label: 'missing open, create', active: ['define', 'use'], expected: 'use' },
  { label: 'missing use, define', active: ['create', 'open'], expected: 'open' },
  { label: 'missing use, create', active: ['define', 'open'], expected: 'open' },
  { label: 'missing define, create', active: ['use', 'open'], expected: 'open' },
  { label: 'missing open, use, define', active: ['create'], expected: 'create' },
  { label: 'missing open, use, create', active: ['define'], expected: 'define' },
  { label: 'missing open, define, create', active: ['use'], expected: 'use' },
  { label: 'missing use, define, create', active: ['open'], expected: 'open' },
]

const FooterContainer = defineComponent({
  name: 'FooterContainer',
  props: { modelValue: Boolean },
  emits: ['update:modelValue'],
  setup(props, { slots }) {
    return () =>
      props.modelValue ? h('motion-dialog', {}, [slots.default?.(), slots.footer?.()]) : null
  },
})

describe('layer config', () => {
  it.each(PROPS_MERGE_CASES)(
    'container props: $label → $expected wins',
    async ({ active, expected }) => {
      await mountPropsMerge(active, 'container')
      expectPropsWinner('container', expected)
    },
  )

  it.each(PROPS_MERGE_CASES)(
    'content props: $label → $expected wins',
    async ({ active, expected }) => {
      await mountPropsMerge(active, 'content')
      expectPropsWinner('content', expected)
    },
  )

  it('clone config folds into use tier ($use wins when open missing)', async () => {
    await mountPropsMerge(['create', 'define', 'use'], 'container', { useVia: 'clone' })
    expectPropsWinner('container', 'use')
  })

  it('open still wins over clone-folded use', async () => {
    await mountPropsMerge(['create', 'define', 'use', 'open'], 'container', { useVia: 'clone' })
    expectPropsWinner('container', 'open')
  })

  it('container slots: use > use:template', async () => {
    const useLayer = createLayer(FooterContainer)
    let dialog!: LayerInstance

    const Content = defineComponent({
      setup() {
        const layer = defineLayer()
        return () =>
          h('div', { class: 'content' }, [
            h(LayerTemplate, { to: layer, name: 'footer' }, () =>
              h('span', { class: 'define-template' }, TIER['define-template']),
            ),
          ])
      },
    })

    const Host = defineComponent({
      setup() {
        dialog = useLayer(Content, {
          container: {
            slots: {
              footer: () => h('span', { class: 'use' }, TIER.use),
            },
          }
        })
        return () =>
          h(LayerTemplate, { to: dialog, container: true, name: 'footer' }, () =>
            h('span', { class: 'use-template' }, TIER['use-template']),
          )
      },
    })

    const wrapper = mount(Host)
    dialog.open({
      props: { message: 'hi' }
    })
    await wrapper.vm.$nextTick()
    await flushPromises()

    expectSlotWinner('use', 'use-template')
  })

  it('content slots: use > use:template', async () => {
    const useLayer = createLayer(Container)
    let dialog!: LayerInstance

    const Content = defineComponent({
      setup(_props, { slots }) {
        return () => h('motion-div', { class: 'content' }, slots.extra?.())
      },
    })

    const Host = defineComponent({
      setup() {
        dialog = useLayer(Content, {
          slots: {
            extra: () => h('span', { class: 'use' }, TIER.use),
          },
        })
        return () =>
          h(LayerTemplate, { to: dialog, name: 'extra' }, () =>
            h('span', { class: 'use-template' }, TIER['use-template']),
          )
      },
    })

    const wrapper = mount(Host)
    dialog.open({ props: { message: 'hi' } })
    await wrapper.vm.$nextTick()
    await flushPromises()

    expectSlotWinner('use', 'use-template')
  })

  it('container slots: define > define:template', async () => {
    const useLayer = createLayer(FooterContainer)
    let dialog!: LayerInstance

    const Content = defineComponent({
      setup() {
        const layer = defineLayer({
          slots: {
            footer: () => h('span', { class: 'define' }, TIER.define),
          },
        })
        return () =>
          h('div', { class: 'content' }, [
            h(LayerTemplate, { to: layer, name: 'footer' }, () =>
              h('span', { class: 'define-template' }, TIER['define-template']),
            ),
          ])
      },
    })

    const Host = defineComponent({
      setup() {
        dialog = useLayer(Content)
        return () => h('motion-host')
      },
    })

    const wrapper = mount(Host)
    dialog.open({ props: { message: 'hi' } })
    await wrapper.vm.$nextTick()
    await flushPromises()

    expectSlotWinner('define', 'define-template')
  })
})

function has(active: PropsTier[], tier: PropsTier) {
  return active.includes(tier)
}

async function mountPropsMerge(
  active: PropsTier[],
  side: 'container' | 'content',
  options: { useVia?: 'use' | 'clone' } = {},
) {
  const { useVia = 'use' } = options

  const useLayer = has(active, 'create')
    ? side === 'container'
      ? createLayer(Container, { props: { title: TIER.create } })
      : createLayer(Container, { content: { props: { message: TIER.create } } })
    : createLayer(Container)

  const Content =
    side === 'container'
      ? has(active, 'define')
        ? makeContentWithDefineLayer({ props: { title: TIER.define } })
        : makeContent()
      : has(active, 'define')
        ? makeContentWithDefineLayer({ content: { props: { message: TIER.define } } })
        : makeContent()

  let dialog!: LayerInstance

  const Host = defineComponent({
    setup() {
      const useConfig: LayerConfigInstance | undefined =
        has(active, 'use') && useVia === 'use'
          ? side === 'container'
            ? { container: { props: { title: TIER.use } } }
            : { props: { message: TIER.use } }
          : undefined

      const base = useLayer(Content, useConfig)

      if (has(active, 'use') && useVia === 'clone') {
        const cloneConfig: LayerConfigInstance =
          side === 'container'
            ? { container: { props: { title: TIER.use } } }
            : { props: { message: TIER.use } }
        dialog = base.clone(cloneConfig)
      } else {
        dialog = base
      }

      onMounted(() => {
        if (side === 'container') {
          const openArgs: LayerConfigInstance = { props: { message: 'hi' } }
          if (has(active, 'open')) {
            openArgs.container = { props: { title: TIER.open } }
          }
          dialog.open(openArgs)
          return
        }

        if (has(active, 'open')) {
          dialog.open({ props: { message: TIER.open } })
        } else {
          dialog.open()
        }
      })

      return () => h('motion-host')
    },
  })

  mount(Host)
  await flushPromises()
}

function readPropsProbe(side: 'container' | 'content') {
  if (side === 'container') {
    return queryBodyDialog()?.getAttribute('data-title') ?? null
  }
  return document.body.querySelector('.msg')?.textContent ?? null
}

function expectPropsWinner(side: 'container' | 'content', expected: PropsTier) {
  expect(readPropsProbe(side)).toBe(TIER[expected])
}

function expectSlotWinner(winner: SlotTier, loser: SlotTier) {
  expect(document.body.querySelector(`.${winner}`)?.textContent).toBe(TIER[winner])
  expect(document.body.querySelector(`.${loser}`)).toBeFalsy()
}
