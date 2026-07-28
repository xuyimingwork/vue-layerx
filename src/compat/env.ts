import { version } from 'vue'

/** True when running under Vue 2.x (incl. 2.7). Bound once at module load. */
export const isVue2 = version.startsWith('2.')
