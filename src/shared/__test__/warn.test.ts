import { afterEach, describe, expect, it, vi } from 'vitest'
import { warn } from '@/shared/warn'

describe('warn', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('should write to console.warn in non-production', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    warn('hello')
    expect(spy).toHaveBeenCalledWith('[vue-layerx] hello')
  })

  it('should no-op when NODE_ENV is production', () => {
    vi.stubEnv('NODE_ENV', 'production')
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    warn('hello')
    expect(spy).not.toHaveBeenCalled()
  })
})
