# Forum helper

Quick helper for posting updates via API (requires `COLOSSEUM_API_KEY`).

```bash
COLOSSEUM_API_KEY=... \
./scripts/forum-post.sh "EchoVault progress update" "Short body here" "progress-update,ai,infra"
```

Notes:
- Uses `COLOSSEUM_API_BASE` if you want a different API base.
- Keep the API key in `.env.local` (never commit).
