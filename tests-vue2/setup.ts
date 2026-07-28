import Vue from 'vue'
import { afterEach } from 'vitest'
import { clearBody } from './helpers/dom'

/** Fixture tags (`motion-dialog`, `motion-drawer`, …) are plain custom elements. */
Vue.config.ignoredElements = [/^motion-/]

afterEach(() => {
  clearBody()
})
