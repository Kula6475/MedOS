import { safeProviderFailure } from "./fireworks-errors"
import type { ModelProvider, ModelProviderRequest, ModelProviderResult } from "./model-provider"

export class FallbackModelProvider implements ModelProvider {
  readonly name: ModelProvider["name"]

  constructor(
    private readonly primary: ModelProvider,
    private readonly fallback: ModelProvider,
  ) {
    this.name = primary.name
  }

  async generate<TOutput>(request: ModelProviderRequest<TOutput>): Promise<ModelProviderResult<TOutput>> {
    try {
      return await this.primary.generate(request)
    } catch (caught) {
      const failure = safeProviderFailure(caught)
      const result = await this.fallback.generate(request)
      return {
        ...result,
        fallbackUsed: true,
        attemptedProvider: this.primary.name,
        retryCount: failure.retryCount,
        primaryFailure: failure,
      }
    }
  }
}
