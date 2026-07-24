import { describe, expect, it } from "vitest"

import { GET } from "./route"

describe("GET /api/health", () => {
  it("returns a 200 with status ok and provider mode info", async () => {
    const response = await GET()
    expect(response.status).toBe(200)

    const body = await response.json()
    expect(body.status).toBe("ok")
    expect(body.service).toBe("medos-backend")
    expect(typeof body.timestamp).toBe("string")
    expect(body.modelProvider).toBe("mock")
    expect(body.observabilityProvider).toBe("local")
  })
})
