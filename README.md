# ModelVI MCP — let any AI agent schedule posts across every creator platform

Give Claude, Cursor, or any MCP-compatible agent the power to **schedule and automate posts across 14 creator platforms** through one partner API — turn your agent into a cross-platform **posting bot** with real **posting automation**. Drop this server into your agent, add your key, and your agent schedules posts everywhere.

**[▶ Get your API key →](https://modelvi.com/sign-up?utm_source=github&utm_medium=owned-track&utm_campaign=modelvi-mcp)** · [Docs](https://modelvi.com/partner-api-docs) · [Pricing](https://modelvi.com/pricing)

![status](https://img.shields.io/badge/example-MIT-blue) ![mcp](https://img.shields.io/badge/MCP-server-black) ![node](https://img.shields.io/badge/node-18+-green)

---

## What this is

A minimal, MIT-licensed [MCP](https://modelcontextprotocol.io) server (TypeScript/Node) that exposes the ModelVI **Partner API** as agent tools. Get a key, add the server to your agent, and it can list your models, list connected accounts, schedule posts, and check results across every platform ModelVI supports. Intentionally tiny — it just calls the public API and returns the result. Nothing proprietary. Copy it and go.

## Popular use cases — posting automation for AI agents

Common things developers and agencies build with this MCP server:

- **Schedule posts / post scheduling** — queue captions across all 14 platforms at set times from one agent.
- **Posting automation** — hand the whole cross-platform posting workflow to an AI agent, end to end.
- **Cross-platform post bot** — one agent, one key, every connected creator account.
- **Content scheduling for creator agencies** — bulk-schedule a model's drops without logging into each platform.

All built on the public ModelVI Partner API — [get a free API key →](https://modelvi.com/sign-up?utm_source=github&utm_medium=owned-track&utm_campaign=modelvi-mcp) and your agent is scheduling posts in minutes.

## Quickstart (~5 min)

**1. Get your API key** → **[modelvi.com/sign-up](https://modelvi.com/sign-up?utm_source=github&utm_medium=owned-track&utm_campaign=modelvi-mcp)**. Partner keys look like `mvk_<keyId>_<secret>`.

**2. Install & build**
```bash
npm install
npm run build
```

**3. Add to your agent** — e.g. Claude Desktop `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "modelvi": {
      "command": "node",
      "args": ["/path/to/modelvi-mcp/dist/index.js"],
      "env": { "MODELVI_API_KEY": "mvk_<keyId>_<secret>" }
    }
  }
}
```

That's it. Your agent now has these tools:

| Tool | Endpoint | What it does |
|------|----------|--------------|
| `list_models` | `GET /model_list` | Your models — grab a model id |
| `list_accounts` | `GET /account_list` | Platform accounts connected to your models |
| `schedule_post` | `POST /schedule` | Create a scheduled post for a model across platforms |
| `get_schedule_result` | `GET /schedule_result[/{id}]` | List scheduled-post results, or one by id |

## Try it

Ask your agent:

> "Schedule 'New drop is live ✨' for model `<modelId>` on FAN and ONLYFANS for Aug 1 at 18:00 UTC as a free post."

Your agent calls `schedule_post`, which builds this request body (platform **CODES**, not brand names; the caption field is `title`; the time field is `scheduledAt`, camelCase UTC):

```json
{
  "model": "<modelId>",
  "platforms": ["FAN", "ONLYFANS"],
  "title": "New drop is live ✨",
  "scheduledAt": "2026-08-01T18:00:00Z",
  "type": 1
}
```

Every `200` response is wrapped in an envelope — this server unwraps it and hands your agent just the `payload`:

```json
{ "success": true, "payload": { "...": "the created schedule object" } }
```

**Post `type`:** `1`=FREE · `2`=FANS · `3`=PAID. **Platform CODES:** `F2F · FNC · FAN · KNKY · MALOUM · ONLYFANS · LOYALFANS · MYMFANS · FETLIFE · FOURBASED · FANVUE · BESTFANS · FANSYME · BREZZELS`.

## Ready to build?

**[▶ Get your API key →](https://modelvi.com/sign-up?utm_source=github&utm_medium=owned-track&utm_campaign=modelvi-mcp)** — see [pricing](https://modelvi.com/pricing).

## Links & notes

[Docs](https://modelvi.com/partner-api-docs) · [API reference](https://modelvi.com/partner-api-docs) · [Pricing](https://modelvi.com/pricing) · [Dashboard](https://modelvi.com/dashboard)

> This is an **example integration**, not production code — it omits retries, pagination, rate-limit backoff, and rich error handling (see the [docs](https://modelvi.com/partner-api-docs) for those). It talks only to the public ModelVI Partner API; there's no proprietary logic here.

MIT licensed.
