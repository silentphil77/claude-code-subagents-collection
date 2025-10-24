---
"bwc-cli": patch
---

Fix Windows compatibility for Svelte command files and update registry

**BREAKING CHANGE**: Svelte command names have changed for Windows compatibility

- Renamed 16 Svelte command files: `svelte:*.md` → `svelte-*.md` (colons not allowed on Windows)
- Updated command names from `/svelte:*` to `/svelte-*` (e.g., `/svelte:test` → `/svelte-test`)
- Regenerated registry.json to reflect correct filenames and command names
- All Svelte commands now work correctly on Windows, Linux, and macOS

**Migration Guide for Users:**
If you previously installed Svelte commands with colons (e.g., `/svelte:test`), you'll need to:
1. Remove old command files from `.claude/commands/` (files named `svelte:*.md`)
2. Reinstall using new names: `bwc add --command svelte-test`
3. Update any references in your workflow from `/svelte:*` to `/svelte-*`
