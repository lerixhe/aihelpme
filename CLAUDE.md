# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project summary
AI Help Me is a Chrome extension (MV3) built with Plasmo + React + TypeScript. It lets users select text on any page, trigger AI actions from an inline toolbar, and continue conversation in a floating chat panel.

Product constraints already implemented:
- AI backend uses an OpenAI-compatible `/chat/completions` endpoint.
- Default prompt context includes selected text + page title + page URL.
- Translation target language is configurable in Options.
- Conversation is per-page in-memory only (refresh/close clears it).
- Custom action templates must include `{text}`.

## Common commands
Use Node LTS if you manage Node via nvm.

```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm use --lts

npm install
```

Development/build commands:

```bash
npm run dev        # Plasmo dev build/watch
npm run typecheck  # TypeScript check (no emit)
npm run build      # Production build
npm run package    # Package extension build
```

Manual loading in Chrome (prod build):
1. `npm run build`
2. Open `chrome://extensions`
3. Enable Developer mode
4. Load unpacked extension from `build/chrome-mv3-prod`

Current repo status for quality commands:
- Lint: not configured (no lint script/config in repo)
- Tests: not configured (no test runner/scripts in repo)
- Single test command: N/A until a test framework is added

## High-level architecture
The extension has 3 runtime contexts plus shared core modules:

1. **Content script UI (`src/contents/main.tsx`)**
   - Detects selection + computes anchor position.
   - Renders inline toolbar (`SelectionToolbar`) and floating chat panel (`ChatPanel`).
   - Builds prompts (built-in/custom/free input), appends page context, keeps chat history in React state.
   - Sends AI requests through messaging layer, never directly to remote API.

2. **Background service worker (`src/background/index.ts`, entry `background.ts`)**
   - Registers `chrome.runtime.onMessage` handler for `AI_HELP_ME_ASK`.
   - Reads settings from `chrome.storage.sync`.
   - Calls OpenAI-compatible endpoint with stored base URL/key/model.
   - Normalizes assistant response payloads and returns unified `{ ok, data|error }` response.

3. **Options page (`src/options/index.tsx`, entry `options.tsx`)**
   - Edits API config + translation language + custom action templates.
   - Validates custom template includes `{text}` before save.
   - Persists settings via shared storage module.

4. **Shared core (`src/shared/*`)**
   - `types.ts`: message/settings/domain types.
   - `storage.ts`: settings defaults + `chrome.storage.sync` read/write.
   - `prompt.ts`: built-in/custom/free prompt assembly + page context append.
   - `selection.ts`: selected text + anchor extraction.
   - `messaging.ts`: content → background request wrapper.

## Key data flow
1. User selects text on page.
2. Content script reads `SelectionContext` and toolbar anchor.
3. User clicks built-in/custom action (or enters free input).
4. Prompt is generated and enriched with page title/URL.
5. Content script sends full message history via `askAi`.
6. Background receives `AI_HELP_ME_ASK`, calls OpenAI-compatible API, returns normalized response.
7. Content script appends assistant/error message to local chat state.

## Critical implementation invariants (avoid regressions)
- Content script entry must remain a **default-exported React component** (Plasmo expectation).
- Background message listener must be registered at module load time; `setupBackgroundMessageHandler()` should be called by the background entry path.
- Toolbar/chat root uses `data-ai-help-me-root="true"`; selection/mousedown handlers must keep ignoring events inside this root, or toolbar input interaction will break/hide unexpectedly.
- Keep AI calls in background context (content script should only message background).
- Preserve `{text}` placeholder validation for custom actions.

## Repo-specific notes
- Root `background.ts` and `options.tsx` are lightweight Plasmo entry files that re-export/import real implementations from `src/*`.
- Build-time warning about missing `svgo` may appear (`htmlnano minifySvg`), but current build still succeeds.
- No `.cursor/rules`, `.cursorrules`, `.github/copilot-instructions.md`, or root README were found in this repo at the time of writing.
