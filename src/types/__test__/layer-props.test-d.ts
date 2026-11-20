/**
 * Unit type gate for Element Plus containers (root has element-plus).
 * Consumer-facing createLayer / useLayer live in tests-vue3/typecheck.
 */
import { describe, test } from 'vitest'
import { ElDialog } from 'element-plus'
import { createLayer } from '@/api/create-layer'

describe('createLayer — Element Plus', () => {
  test('container props are typed', () => {
    createLayer(ElDialog, { props: { width: '480px', appendToBody: true } })
    createLayer(ElDialog, {
      props: {
        // @ts-expect-error — appendToBody is boolean
        appendToBody: 'yes',
      },
    })
  })
})
