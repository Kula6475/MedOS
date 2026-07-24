import {
  BuiltInAgent,
  CopilotRuntime,
  createCopilotRuntimeHandler,
} from "@copilotkit/runtime/v2"
import { createOpenAI } from "@ai-sdk/openai"
import {
  MEDOS_COPILOT_PROMPT,
  medosCopilotTools,
} from "@/lib/medos-copilot"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const DEFAULT_FIREWORKS_MODEL =
  "accounts/fireworks/models/llama-v3p3-70b-instruct"

export async function POST(request: Request) {
  const apiKey = process.env.FIREWORKS_API_KEY

  if (!apiKey) {
    return Response.json(
      {
        error: "MedOS Copilot is not configured.",
        setup: "Add FIREWORKS_API_KEY to the deployment environment.",
      },
      { status: 503 },
    )
  }

  const fireworks = createOpenAI({
    apiKey,
    baseURL: "https://api.fireworks.ai/inference/v1",
  })

  const copilotRuntime = new CopilotRuntime({
    agents: () => ({
      default: new BuiltInAgent({
        model: fireworks(
          process.env.FIREWORKS_MODEL ?? DEFAULT_FIREWORKS_MODEL,
        ),
        prompt: MEDOS_COPILOT_PROMPT,
        tools: medosCopilotTools,
        maxSteps: 4,
        maxOutputTokens: 900,
        temperature: 0.1,
      }),
    }),
  })

  const handleRequest = createCopilotRuntimeHandler({
    runtime: copilotRuntime,
    basePath: "/api/copilotkit",
    mode: "single-route",
    activateChannels: false,
  })

  return handleRequest(request)
}
