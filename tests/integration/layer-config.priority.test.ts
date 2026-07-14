import { defineComponent, h, onMounted, type Component } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import {
  createLayer,
  defineLayer,
  LayerTemplate,
  type LayerConfigContent,
  type LayerConfigContainer,
  type LayerInstance,
} from '@/index'
import { flushPromises } from '@tests/helpers/dom'
import {
  Container,
  makeContent,
  makeContentWithDefineLayer,
  queryBodyDialog,
} from '@tests/fixtures/components'

// Props: open > use (= clone folded) > define > create
// Container slots: open > use > use:template > define > define:template > create
// Content slots: open > use > use:template > define > create (no define:template API)

const TIER = {
  create: 'from-create',
  define: 'from-define',
  use: 'from-use',
  open: 'from-open',
  'use-template': 'from-use-template',
  'define-template': 'from-define-template',
} as const

type PropsTier = 'create' | 'define' | 'use' | 'open'
type ContainerSlotTier =
  | 'create'
  | 'define-template'
  | 'define'
  | 'use-template'
  | 'use'
  | 'open'
type ContentSlotTier = 'create' | 'define' | 'use-template' | 'use' | 'open'

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

const CLONE_PROPS_CASES = PROPS_MERGE_CASES.filter(({ active }) => active.includes('use'))

const CONTAINER_SLOT_TIERS: ContainerSlotTier[] = [
  'create',
  'define-template',
  'define',
  'use-template',
  'use',
  'open',
]
const CONTAINER_SLOT_PRIORITY: ContainerSlotTier[] = [
  'open',
  'use',
  'use-template',
  'define',
  'define-template',
  'create',
]

const CONTENT_SLOT_TIERS: ContentSlotTier[] = ['create', 'define', 'use-template', 'use', 'open']
const CONTENT_SLOT_PRIORITY: ContentSlotTier[] = [
  'open',
  'use',
  'use-template',
  'define',
  'create',
]

const CONTAINER_SLOT_MERGE_CASES = buildSlotMergeCases(
  CONTAINER_SLOT_TIERS,
  CONTAINER_SLOT_PRIORITY,
)
const CONTENT_SLOT_MERGE_CASES = buildSlotMergeCases(CONTENT_SLOT_TIERS, CONTENT_SLOT_PRIORITY)

const FooterContainer = defineComponent({
  name: 'FooterContainer',
  props: { modelValue: Boolean },
  emits: ['update:modelValue'],
  setup(props, { slots }) {
    return () =>
      props.modelValue ? h('motion-dialog', {}, [slots.default?.(), slots.footer?.()]) : null
  },
})

describe('layer config priority', () => {
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

  it.each(CLONE_PROPS_CASES)(
    'clone container props: $label → $expected wins',
    async ({ active, expected }) => {
      await mountPropsMerge(active, 'container', { useVia: 'clone' })
      expectPropsWinner('container', expected)
    },
  )

  it.each(CLONE_PROPS_CASES)(
    'clone content props: $label → $expected wins',
    async ({ active, expected }) => {
      await mountPropsMerge(active, 'content', { useVia: 'clone' })
      expectPropsWinner('content', expected)
    },
  )

  it.each(CONTAINER_SLOT_MERGE_CASES)(
    'container slots: $label → $expected wins',
    async ({ active, expected }) => {
      await mountSlotMerge(active, 'container')
      expectOnlySlotTier(expected)
    },
  )

  it.each(CONTENT_SLOT_MERGE_CASES)(
    'content slots: $label → $expected wins',
    async ({ active, expected }) => {
      await mountSlotMerge(active, 'content')
      expectOnlySlotTier(expected)
    },
  )
})

function buildSlotMergeCases<T extends string>(
  allTiers: T[],
  priority: T[],
): { label: string; active: T[]; expected: T }[] {
  const cases: { label: string; active: T[]; expected: T }[] = []

  for (const missing of allTiers) {
    const active = allTiers.filter((tier) => tier !== missing)
    cases.push({
      label: `missing ${missing}`,
      active,
      expected: priority.find((tier) => active.includes(tier))!,
    })
  }

  if (allTiers.includes('open' as T)) {
    for (const second of allTiers.filter((tier) => tier !== 'open')) {
      const active = allTiers.filter((tier) => tier !== 'open' && tier !== second)
      cases.push({
        label: `missing open, ${second}`,
        active,
        expected: priority.find((tier) => active.includes(tier))!,
      })
    }
  }

  return cases
}

function slotMarker(tier: ContainerSlotTier | ContentSlotTier) {
  return () => h('span', { class: tier }, TIER[tier])
}

function hasProps(active: PropsTier[], tier: PropsTier) {
  return active.includes(tier)
}

function hasSlot<T extends string>(active: T[], tier: T) {
  return active.includes(tier)
}

async function mountPropsMerge(
  active: PropsTier[],
  side: 'container' | 'content',
  options: { useVia?: 'use' | 'clone' } = {},
) {
  const { useVia = 'use' } = options

  const useLayer = hasProps(active, 'create')
    ? side === 'container'
      ? createLayer(Container, { props: { title: TIER.create } })
      : createLayer(Container, { content: { props: { message: TIER.create } } })
    : createLayer(Container)

  const Content =
    side === 'container'
      ? hasProps(active, 'define')
        ? makeContentWithDefineLayer({ props: { title: TIER.define } })
        : makeContent()
      : hasProps(active, 'define')
        ? makeContentWithDefineLayer({ content: { props: { message: TIER.define } } })
        : makeContent()

  let dialog!: LayerInstance

  const Host = defineComponent({
    setup() {
      const useConfig: LayerConfigContent | undefined =
        hasProps(active, 'use') && useVia === 'use'
          ? side === 'container'
            ? { container: { props: { title: TIER.use } } }
            : { props: { message: TIER.use } }
          : undefined

      const base = useLayer(Content, useConfig)

      if (hasProps(active, 'use') && useVia === 'clone') {
        const cloneConfig: LayerConfigContent =
          side === 'container'
            ? { container: { props: { title: TIER.use } } }
            : { props: { message: TIER.use } }
        dialog = base.clone(cloneConfig)
      } else {
        dialog = base
      }

      onMounted(() => {
        if (side === 'container') {
          const openArgs: LayerConfigContent = { props: { message: 'hi' } }
          if (hasProps(active, 'open')) {
            openArgs.container = { props: { title: TIER.open } }
          }
          dialog.open(openArgs)
          return
        }

        if (hasProps(active, 'open')) {
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

async function mountSlotMerge(
  active: ContainerSlotTier[] | ContentSlotTier[],
  side: 'container' | 'content',
) {
  const slotName = side === 'container' ? 'footer' : 'extra'
  const shell = side === 'container' ? FooterContainer : Container

  const createConfig: LayerConfigContainer | undefined = hasSlot(active, 'create')
    ? side === 'container'
      ? { slots: { [slotName]: slotMarker('create') } }
      : { content: { slots: { [slotName]: slotMarker('create') } } }
    : undefined

  const useLayer = createLayer(shell, createConfig ?? {})
  const Content = buildSlotContent(active, side, slotName)
  let dialog!: LayerInstance

  const Host = defineComponent({
    setup() {
      const useConfig: LayerConfigContent | undefined = hasSlot(active, 'use')
        ? side === 'container'
          ? { container: { slots: { [slotName]: slotMarker('use') } } }
          : { slots: { [slotName]: slotMarker('use') } }
        : undefined

      dialog = useLayer(Content, useConfig)

      onMounted(() => {
        const openArgs: LayerConfigContent = { props: { message: 'hi' } }
        if (hasSlot(active, 'open')) {
          if (side === 'container') {
            openArgs.container = { slots: { [slotName]: slotMarker('open') } }
          } else {
            openArgs.slots = { [slotName]: slotMarker('open') }
          }
        }
        dialog.open(openArgs)
      })

      if (hasSlot(active, 'use-template')) {
        return () =>
          h(LayerTemplate, { to: dialog, container: side === 'container', name: slotName }, () =>
            slotMarker('use-template')(),
          )
      }

      return () => h('motion-host')
    },
  })

  mount(Host)
  await flushPromises()
}

function buildSlotContent(
  active: ContainerSlotTier[] | ContentSlotTier[],
  side: 'container' | 'content',
  slotName: string,
): Component {
  const needsDefineLayer =
    hasSlot(active, 'define') || hasSlot(active, 'define-template')

  if (side === 'content') {
    return defineComponent({
      setup(_props, { slots }) {
        const defineConfig: LayerConfigContainer = hasSlot(active, 'define')
          ? { content: { slots: { [slotName]: slotMarker('define') } } }
          : {}
        if (hasSlot(active, 'define')) {
          defineLayer(defineConfig)
        }

        return () => h('motion-div', { class: 'content' }, slots[slotName]?.())
      },
    })
  }

  return defineComponent({
    setup() {
      const defineConfig: LayerConfigContainer = hasSlot(active, 'define')
        ? { slots: { [slotName]: slotMarker('define') } }
        : {}
      const layer = needsDefineLayer ? defineLayer(defineConfig) : null

      return () =>
        h('div', { class: 'content' }, [
          layer && hasSlot(active, 'define-template')
            ? h(LayerTemplate, { to: layer, name: slotName }, () =>
                slotMarker('define-template')(),
              )
            : null,
        ])
    },
  })
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

function expectOnlySlotTier(expected: ContainerSlotTier | ContentSlotTier) {
  expect(document.body.querySelector(`.${expected}`)?.textContent).toBe(TIER[expected])

  const allMarkers = [...CONTAINER_SLOT_TIERS, ...CONTENT_SLOT_TIERS]
  for (const tier of new Set(allMarkers)) {
    if (tier !== expected) {
      expect(document.body.querySelector(`.${tier}`)).toBeFalsy()
    }
  }
}
