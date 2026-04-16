# AGENTS.md

## Project Summary
AI Help Me is a Chrome extension (MV3) built with Plasmo + React + TypeScript. It lets users select text on any page, trigger AI actions from an inline toolbar, and continue conversation in a floating chat panel.

## Quick Facts
- Chrome extension built with Plasmo + React + TypeScript.
- AI backend uses an OpenAI-compatible `/chat/completions` endpoint.
- Default prompt context includes selected text, page title, and page URL.
- Translation target language is configurable in Options.
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
- Runtime contexts:
  - `src/contents/main.tsx`: detects selection from range/input/textarea paths, computes toolbar anchor, renders `SelectionToolbar` and `ChatPanel`, stores per-page chat state in React, and sends requests through shared messaging.
  - `src/background/index.ts` via `background.ts`: registers the `chrome.runtime.onMessage` handler, reads settings from `chrome.storage.sync`, calls the OpenAI-compatible API, and normalizes responses.
  - `src/options/index.tsx` via `options.tsx`: edits API config, translation language, and custom actions, then validates and persists settings.
- Shared logic lives in `src/shared/*`:
  - `types.ts`: message, settings, and domain types.
  - `selection.ts`: selection snapshot extraction and anchor calculation.
  - `prompt.ts`: built-in/custom/free prompt assembly plus page context.
  - `messaging.ts`: content-to-background request wrapper.
  - `storage.ts`: `chrome.storage.sync` settings persistence.

## Data Flow
1. User selects text on the page.
2. Content script captures a selection snapshot with selected text, page context, and toolbar anchor.
3. User triggers a built-in action, custom action, or free-form prompt.
4. Content script assembles the prompt, appends page title and URL context, and sends message history through `askAi`.
5. Background receives `AI_HELP_ME_ASK`, calls the configured API, normalizes the response, and returns `{ ok, data|error }`.
6. Content script appends the assistant or error message to local per-page chat state.

## Invariants
- Keep `data-ai-help-me-root="true"` on the extension UI root. Selection and mousedown handlers depend on ignoring events inside that subtree.
- Keep the background message listener registered at module load time.
- Keep the content script entry as a default-exported React component for Plasmo.
- Keep AI requests in the background context; content script should only message background.
- Preserve `{text}` placeholder validation for custom actions before saving.
- Conversation is intentionally per-page in-memory only; refresh/close clears it.

## Verified Repo Conventions
- TypeScript uses strict mode with `moduleResolution: "Bundler"` and the `~/*` alias rooted at `src/*`.
- Settings defaults live in `src/shared/storage.ts`; current defaults include `https://api.openai.com/v1` and model `gpt-4o-mini`.
- Root `background.ts` and `options.tsx` are thin Plasmo entry files that delegate to implementations under `src/*`.
- Content script currently matches `<all_urls>`. Restricted Chrome pages like `chrome://*` and the Chrome Web Store are still non-injectable by extension design.
- Follow-up compatibility target: broaden content-script injection coverage for iframe/about:blank-like contexts. Verify any related manifest changes in both `.plasmo/chrome-mv3.plasmo.manifest.json` and `build/chrome-mv3-prod/manifest.json`, and avoid `package.json > manifest.content_scripts` overrides that create duplicate entries.

## Manual Verification
- After `npm run build`, load `build/chrome-mv3-prod` in `chrome://extensions` as an unpacked extension.
