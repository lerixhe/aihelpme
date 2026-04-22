# AGENTS.md

## Project Summary
Chrome extension (MV3) built with Plasmo + React + TypeScript. Users select text on any page, trigger AI actions from an inline toolbar, and continue conversation in a floating chat panel. AI backend uses an OpenAI-compatible `/chat/completions` endpoint.

## Quick Facts
- No lint or test setup. Use `npm run typecheck` and `npm run build` for verification.
- Build may warn about missing `svgo` for `htmlnano minifySvg`; builds still succeed.
- TypeScript path alias: `~/*` maps to `src/*` (tsconfig `paths`).
- Design docs: `DESIGN.md`.
- UI module naming (触发按钮/环形菜单/对话窗 etc.) is defined in `DESIGN.md` §0 and CLAUDE.md.

## Commands
- `npm run dev`: Plasmo dev build/watch.
- `npm run typecheck`: TypeScript only, no emit.
- `npm run build`: production extension build. Run this after code changes.
- `npm run package`: package the extension bundle.

## Entry Points
- `src/contents/main.tsx`: content-script UI entry (must be default-exported React component for Plasmo).
- `background.ts`: thin entry; calls `setupBackgroundMessageHandler()` from `src/background/index.ts`.
- `options.tsx`: thin entry; re-exports from `src/options/index.tsx`.

## Architecture
Three runtime contexts communicate via `chrome.runtime.onMessage`:

- **Content script** (`src/contents/main.tsx`): detects selection from range/input/textarea, computes toolbar anchor, renders `SelectionToolbar` and `UnifiedPanel`, stores per-page conversation state in React.
- **Background** (`src/background/index.ts` via `background.ts`): registers the message handler, reads settings from `chrome.storage.sync`, calls the API, normalizes responses. **Never move API requests into the content script.**
- **Options** (`src/options/index.tsx` via `options.tsx`): edits API config, translation language, and custom actions, then validates and persists settings.

Shared logic in `src/shared/*`: `types.ts`, `selection.ts`, `prompt.ts`, `messaging.ts`, `storage.ts`.

## Invariants
- Keep `data-ai-help-me-root="true"` on the extension UI root. Selection and mousedown handlers depend on ignoring events inside that subtree.
- Keep the background message listener registered at module load time.
- Keep AI requests in the background context; content script should only message background.
- Preserve `{text}` placeholder validation for custom actions before saving.
- Conversation is intentionally per-page in-memory only; refresh/close clears it.

## Selection UI Pitfalls
- Plasmo content-script UI runs inside Shadow DOM. Do not rely on `document.activeElement` alone; use deep active-element traversal through nested `shadowRoot` boundaries.
- Use `event.composedPath()` instead of `event.target` for extension UI event filtering so Shadow DOM retargeting doesn't bypass root checks.
- Text selection inside toolbar/chat inputs must never update page selection context, toolbar anchor, or toolbar visibility.
- Do not let transient page-selection loss during focus transfer into extension inputs hide the toolbar. Preserve that state during extension-internal interaction.
- When debugging selection bugs, reload the extension and refresh the target tab before assuming logic is wrong. Stale injected code is a common cause.

## Manual Verification
- After `npm run build`, load `build/chrome-mv3-prod` in `chrome://extensions` as an unpacked extension.
- After reloading the extension, reload the target web page. Existing tabs keep old content-script instances.
- If a content-script change still doesn't appear after extension + page reload, close and reopen the tab.
- For background/service-worker changes, verify from the extension's service worker inspector.
