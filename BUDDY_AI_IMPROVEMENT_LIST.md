# Buddy AI Improvement List

Verified on 2026-03-28 after a local code audit plus:

- `npm.cmd run lint`
- `npm.cmd run build`

## Already working in code

1. Language labels use `English` and `Hinglish` in the chat input toggle.
2. `window._buddyLanguage` is written from the chatbot context.
3. Admin pages already mount the Buddy AI widget through the shared admin layout.
4. TTS route calls Sarvam with `model: "bulbul:v3"`.
5. STT route calls Sarvam with `model: "saaras:v3"`.
6. Chat route enforces a 100-word default cap and a 200-word cap for detailed or safety-heavy prompts.

## Fixed now

1. Response cleaning now inserts a real bullet character and keeps newline separation for list items.
2. Chat message bubbles now preserve line breaks so bullet lists do not collapse into one paragraph.
3. New bot replies can auto-play TTS when `VOICE ON` is enabled instead of only after voice-originated queries.
4. The autoplay-blocked fallback label now uses a clean `Replay` action.
5. Voice input now pushes interim transcript text into the controlled chat input, updates status between `Listening` and `Processing`, and uses clearer retry toasts.

## Remaining improvements

1. Course-context injection
   Current status: `activeCourseId` exists in chatbot state, but no page is setting a course-specific prompt for Buddy.
   Next step: when a trainee opens a course page, store the active course title/topic in chatbot context and append it to the chat system prompt.

2. Admin quiz-generation context
   Current status: admin pages have the widget, but the chatbot prompt is not specialized for the course-builder flow.
   Next step: when the admin is inside course creation or quiz generation, add an admin-only prompt addendum like "help generate industrial safety quiz questions for [course title]".

3. Browser-level voice QA
   Current status: the code is wired, but mic and autoplay behavior still needs live browser validation across Chrome and Edge.
   Next step: test `VOICE ON`, mic live transcript, ASR fallback, autoplay-block replay, and empty-audio handling in the browser.

4. Legacy helper cleanup
   Current status: `utils/sarvamAI.ts` still contains older helper methods for `saaras:v1` and legacy TTS payload shapes, even though the active chatbot path uses the updated API routes.
   Next step: remove or modernize those unused helpers so future edits do not accidentally regress to old models.
