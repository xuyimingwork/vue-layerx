import type { LayerConfirmResult } from '@/types/confirm'

export type LayerConfirmErrorCode = 'close' | 'busy'

export class LayerConfirmError extends Error {
  readonly code: LayerConfirmErrorCode
  readonly result?: LayerConfirmResult

  constructor(options: {
    code: LayerConfirmErrorCode
    result?: LayerConfirmResult
    message?: string
  }) {
    const { code, result, message } = options
    super(
      message ??
        (code === 'busy'
          ? 'confirm() rejected: layer is already open or confirming'
          : `confirm() rejected: closed via ${result!.source}`),
    )
    this.name = 'LayerConfirmError'
    this.code = code
    if (result !== undefined) this.result = result
  }
}
