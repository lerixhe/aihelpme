# AGENTS.md

## Quick Facts
- Chrome extension built with Plasmo + React + TypeScript.
- There is no lint or test setup in this repo. Use `npm run typecheck` and `npm run build` for verification.
- Build may warn about missing `svgo` for `htmlnano minifySvg`; current builds still succeed.

## Commands
- `npm run dev`: Plasmo dev build/watch.
- `npm run typecheck`: TypeScript only, no emit.
- `npm run build`: production extension build. Run this after code changes.
- `npm run package`: package the extension bundle.

## Entry Points
- `src/contents/main.tsx`: content-script UI entry. Must remain a default-exported React component.
- `background.ts`: thin Plasmo background entry; it calls `setupBackgroundMessageHandler()`.
- `options.tsx`: thin Plasmo options entry that re-exports `src/options/index.tsx`.

## Architecture
- Content script handles selection detection, toolbar/chat rendering, prompt assembly, and local per-page conversation state.
- Background handles all remote AI calls. Do not move API requests into the content script.
- Shared logic lives in `src/shared/*`:
  - `selection.ts`: selection snapshot extraction and anchor calculation.
  - `prompt.ts`: built-in/custom/free prompt assembly plus page context.
  - `messaging.ts`: content-to-background request wrapper.
  - `storage.ts`: `chrome.storage.sync` settings persistence.

## Invariants
- Keep `data-ai-help-me-root="true"` on the extension UI root. Selection and mousedown handlers depend on ignoring events inside that subtree.
- Keep the background message listener registered at module load time.
- Preserve `{text}` placeholder validation for custom actions before saving.
- Conversation is intentionally per-page in-memory only; refresh/close clears it.

## Verified Repo Conventions
- TypeScript uses strict mode with `moduleResolution: "Bundler"` and the `~/*` alias rooted at `src/*`.
- Settings defaults live in `src/shared/storage.ts`; current defaults include `https://api.openai.com/v1` and model `gpt-4o-mini`.
- Content script currently matches `<all_urls>`. Restricted Chrome pages like `chrome://*` and the Chrome Web Store are still non-injectable by extension design.

## Manual Verification
- After `npm run build`, load `build/chrome-mv3-prod` in `chrome://extensions` as an unpacked extension.
