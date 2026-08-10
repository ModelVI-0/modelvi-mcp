#!/usr/bin/env node
/**
 * ModelVI MCP server — expose the ModelVI partner API as agent tools.
 *
 * This is a minimal EXAMPLE. It is a pure client wrapper over the PUBLIC
 * ModelVI Partner API: key -> public endpoint -> result. Nothing else.
 * No retries, no pagination, no proprietary logic — copy it and go.
 *
 * Get your API key at https://modelvi.com/sign-up?utm_source=github&utm_medium=owned-track&utm_campaign=modelvi-mcp
 *
 * Run:
 *   npm install && npm run build
 *   MODELVI_API_KEY="mvk_<keyId>_<secret>" node dist/index.js
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const API_BASE =
  process.env.MODELVI_API_BASE ?? "https://modelvi.com/api/partner/v1";
const API_KEY = process.env.MODELVI_API_KEY;
const SIGNUP_URL = "https://modelvi.com/sign-up?utm_source=github&utm_medium=owned-track&utm_campaign=modelvi-mcp";

/**
 * Call the public Partner API and return the unwrapped `payload`.
 * Every authed 200 response is an envelope: { success: true, payload: <data> }.
 */
async function call(path: string, init: RequestInit = {}): Promise<unknown> {
  if (!API_KEY) {
    // The whole example is dead-on-arrival without a key -> signup funnel.
    throw new Error(
      "MODELVI_API_KEY is not set. Get your key at " +
        SIGNUP_URL +
        " and set it in your MCP config."
    );
  }
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      // Partner keys are shaped mvk_<keyId>_<secret>.
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  if (res.status === 401) {
    // Auth failure routes straight back to billing/signup.
    return {
      error: "unauthorized",
      message:
        "Invalid or missing API key (401). Get a valid key at " + SIGNUP_URL,
    };
  }
  if (!res.ok) {
    throw new Error(`ModelVI Partner API ${res.status}: ${await res.text()}`);
  }
  const json = (await res.json()) as { payload?: unknown };
  // Unwrap the envelope — hand back just the payload.
  return json.payload ?? json;
}

function result(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

const server = new McpServer({ name: "modelvi", version: "0.1.0" });

server.registerTool(
  "list_models",
  {
    title: "List models",
    description: "List your models (grab a model id to schedule posts for).",
    inputSchema: {},
  },
  async () => result(await call("/model_list"))
);

server.registerTool(
  "list_accounts",
  {
    title: "List accounts",
    description: "List the platform accounts connected to your models.",
    inputSchema: {},
  },
  async () => result(await call("/account_list"))
);

server.registerTool(
  "schedule_post",
  {
    title: "Schedule post",
    description:
      "Create a scheduled post for a model across one or more platforms.",
    inputSchema: {
      model: z.string().describe("Model id (from list_models)."),
      platforms: z
        .array(z.string())
        .describe(
          "Platform CODES (not brand names): F2F FNC FAN KNKY MALOUM " +
            "ONLYFANS LOYALFANS MYMFANS FETLIFE FOURBASED FANVUE BESTFANS " +
            "FANSYME BREZZELS."
        ),
      title: z
        .string()
        .describe("The caption text (the field is `title`, NOT `caption`)."),
      scheduledAt: z
        .string()
        .describe(
          'ISO-8601 UTC timestamp, camelCase, e.g. "2026-08-01T18:00:00Z".'
        ),
      type: z
        .union([z.literal(1), z.literal(2), z.literal(3)])
        .describe("Post type: 1=FREE, 2=FANS, 3=PAID."),
      medias: z
        .array(
          z.object({
            name: z.string().describe("Uploaded media key."),
            mode: z.string().describe('MIME type, e.g. "image/jpeg".'),
            size: z.number().int().describe("File size in bytes."),
          })
        )
        .optional()
        .describe("Optional media attachments (uploaded ahead of time)."),
    },
  },
  async ({ model, platforms, title, scheduledAt, type, medias }) => {
    const body: Record<string, unknown> = {
      model,
      platforms,
      title,
      scheduledAt,
      type,
    };
    if (medias) body.medias = medias;
    return result(
      await call("/schedule", { method: "POST", body: JSON.stringify(body) })
    );
  }
);

server.registerTool(
  "get_schedule_result",
  {
    title: "Get schedule result",
    description:
      "List scheduled-post results, or fetch one by result id (delivery status).",
    inputSchema: {
      resultId: z
        .string()
        .optional()
        .describe("Optional result id. Omit to list all results."),
    },
  },
  async ({ resultId }) =>
    result(
      await call(
        resultId
          ? `/schedule_result/${encodeURIComponent(resultId)}`
          : "/schedule_result"
      )
    )
);

const transport = new StdioServerTransport();
await server.connect(transport);
