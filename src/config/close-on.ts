import type { CloseOn, CloseOnEntry, CloseOnWhen } from '@/types/config'
import type {
  CloseOnEntryRaw,
  CloseOnPolicyObjectRaw,
  CloseOnRaw,
} from '@/types/config-raw'
import { warn } from '@/shared/warn'

const TOMBSTONE: CloseOnEntry = { when: 'none', confirmed: false }
const ALWAYS: CloseOnEntry = { when: 'always', confirmed: false }

function isCloseOnWhen(value: unknown): value is CloseOnWhen {
  return (
    value === 'none' ||
    value === 'always' ||
    typeof value === 'function'
  )
}

function entryFromWhen(
  when: CloseOnWhen,
  confirmed = false,
): CloseOnEntry {
  if (when === 'none') return { ...TOMBSTONE }
  return { when, confirmed }
}

function normalizePolicyObject(
  value: CloseOnPolicyObjectRaw,
  label: string,
): CloseOnEntry | undefined {
  if (!('when' in value) || value.when === undefined) {
    warn(`closeOn ${label}: object entry requires when; ignored`)
    return undefined
  }
  const when = value.when
  if (!isCloseOnWhen(when)) {
    warn(`closeOn ${label}: invalid when; ignored`)
    return undefined
  }
  if (when === 'none') return { ...TOMBSTONE }
  return {
    when,
    confirmed: value.confirmed === true,
  }
}

function applyEvent(
  result: CloseOn,
  event: string,
  entry: CloseOnEntry | undefined,
): void {
  if (!event || entry === undefined) return
  result[event] = { ...entry }
}

/**
 * Expand CloseOnRaw → Canonical CloseOn (full entries; may include when:'none').
 * Does not mutate the input.
 */
export function normalizeCloseOn(raw?: CloseOnRaw): CloseOn | undefined {
  if (raw === undefined) return undefined

  const result: CloseOn = {}

  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (typeof item === 'string') {
        applyEvent(result, item, ALWAYS)
        continue
      }
      if (item && typeof item === 'object' && 'event' in item) {
        const entryRaw = item as CloseOnEntryRaw
        const { event } = entryRaw
        if (typeof event !== 'string' || !event) {
          warn('closeOn array entry missing event; ignored')
          continue
        }
        const entry = normalizePolicyObject(entryRaw, `event "${event}"`)
        applyEvent(result, event, entry)
        continue
      }
      warn('closeOn array entry invalid; ignored')
    }
    return Object.keys(result).length > 0 ? result : undefined
  }

  if (raw && typeof raw === 'object') {
    for (const [event, value] of Object.entries(raw)) {
      if (value === true) {
        applyEvent(result, event, ALWAYS)
        continue
      }
      if (value === false) {
        applyEvent(result, event, TOMBSTONE)
        continue
      }
      if (isCloseOnWhen(value)) {
        applyEvent(result, event, entryFromWhen(value))
        continue
      }
      if (value && typeof value === 'object') {
        const entry = normalizePolicyObject(
          value as CloseOnPolicyObjectRaw,
          `event "${event}"`,
        )
        applyEvent(result, event, entry)
        continue
      }
      warn(`closeOn event "${event}": invalid value; ignored`)
    }
    return Object.keys(result).length > 0 ? result : undefined
  }

  warn('closeOn: invalid value; ignored')
  return undefined
}

/**
 * Per-event whole-entry replace. when==='none' deletes the key.
 * Does not field-merge when/confirmed across tiers.
 */
export function mergeCloseOn(
  ...sources: (CloseOn | undefined)[]
): CloseOn | undefined {
  const result: CloseOn = {}
  let touched = false

  for (const source of sources) {
    if (!source) continue
    touched = true
    for (const [event, entry] of Object.entries(source)) {
      if (entry.when === 'none') {
        delete result[event]
      } else {
        result[event] = { ...entry }
      }
    }
  }

  if (!touched) return undefined
  return Object.keys(result).length > 0 ? result : undefined
}
