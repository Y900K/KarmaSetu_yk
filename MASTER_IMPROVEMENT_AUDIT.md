# KarmaSetu Master Improvement Audit

Code audit completed against the current repository state on 2026-03-28.

This file is intentionally focused on targeted, low-risk improvements. It does not ask for a rebuild from scratch.

## Legend

- `DONE` = already implemented in code
- `PARTIAL` = present, but incomplete or mismatched with the prompt
- `MISSING` = not implemented yet
- `RISK` = implemented in UI, but backend/data model does not support it correctly
- `UNVERIFIED` = likely okay or partially reviewed, but not fully validated during this audit

## 1. Landing Page, Login, Register

### Current status

- `DONE` Above-the-fold visibility bug does not appear to come from scroll-reveal now. The hero, login, and register pages use direct `animate` transitions, not `whileInView` gating.
- `PARTIAL` Landing navbar is mobile-friendly and already has a hamburger menu.
- `PARTIAL` Landing navbar already has language switching, but only `English` and `Hinglish` are available. `Pure Hindi` is missing.
- `PARTIAL` Navbar CTA already points to `/register`, but the hero section CTA still points to `/login`.
- `DONE` Login page has inline credential errors and wrong-role login protection is enforced in the API.
- `RISK` Register UI supports both phone and email signup, but the register API only accepts email + password. Phone signup is not wired end-to-end.
- `MISSING` Register page does not yet have the password visibility toggle that login already has.
- `UNVERIFIED` Full landing/auth mobile polish across every section was not exhaustively UI-tested in-browser during this audit.

### Key files checked

- `components/home/HeroSection.tsx`
- `components/layout/Navbar.tsx`
- `app/login/page.tsx`
- `app/register/page.tsx`
- `app/api/auth/login/route.ts`
- `app/api/auth/register/route.ts`
- `context/LanguageContext.tsx`

### Safe next steps

1. Change the hero "Get Started" CTA from `/login` to `/register`.
2. Add the same password eye toggle from login to register.
3. Decide whether register should be email-only or fully support phone signup, then align UI and API to one real flow.
4. Extend `LanguageContext` and navbar controls to support `Pure Hindi` in addition to `English` and `Hinglish`.

## 2. Admin Dashboard, Users, Courses, Compliance, Announcements

### Current status

- `DONE` `/admin/dashboard` already redirects to `/dashboard`.
- `MISSING` Main admin dashboard metrics are still hardcoded and do not come from MongoDB.
- `MISSING` Several admin overview cards/charts still use mock data from `data/mockAdminData.ts`.
- `PARTIAL` Admin certificates page already queries live Mongo data, but dashboard certificate counts do not share that same source of truth.
- `DONE` `/admin/users` loads on mount, not on scroll.
- `DONE` `/admin/users` count tabs are derived from `users.length`.
- `DONE` `/admin/users` table already has horizontal scroll.
- `PARTIAL` Bulk actions exist on `/admin/users`, but the bar is not sticky as requested.
- `DONE` "Add Trainee" modal exists and posts to MongoDB through `/api/admin/users`.
- `DONE` `/admin/courses` initial data load is not scroll-triggered.
- `PARTIAL` Bar chart already has a tooltip, but static value labels are missing.
- `MISSING` Donut chart has no tooltip/value-label support.
- `MISSING` Compliance page still uses mock departments and overdue trainees.
- `MISSING` Compliance action buttons do not perform real flows yet.
- `MISSING` Announcements page still uses mock data and local UI-only scheduling state.
- `MISSING` Scheduled announcements are not being persisted with `scheduledAt`.

### Key files checked

- `app/dashboard/page.tsx`
- `app/admin/dashboard/page.tsx`
- `components/admin/overview/CourseCompletionChart.tsx`
- `components/admin/overview/TraineeStatusDonut.tsx`
- `components/admin/overview/DeptComplianceSection.tsx`
- `components/admin/overview/RecentActivityFeed.tsx`
- `components/admin/overview/AlertsSection.tsx`
- `app/admin/users/page.tsx`
- `app/api/admin/users/route.ts`
- `app/admin/courses/page.tsx`
- `app/api/admin/courses/route.ts`
- `app/admin/compliance/page.tsx`
- `app/admin/announcements/page.tsx`
- `data/mockAdminData.ts`

### Safe next steps

1. Replace hardcoded `/dashboard` KPIs with a single admin stats API backed by MongoDB.
2. Move every admin overview widget off `mockAdminData`.
3. Add chart value labels to bars and hover tooltips to the donut chart.
4. Convert compliance action buttons into real modal/API flows.
5. Back announcements with MongoDB, including `scheduledAt`, status badges, and send/schedule behavior.
6. Make the bulk action bar sticky only after the data-source cleanup is stable.

## 3. Course Creation and Course Model

### Current status

- `DONE` Course deadline is already optional in the admin UI.
- `PARTIAL` Admin course form already supports multiple video and PDF inputs in the UI.
- `DONE` Google Drive preview conversion and embeddable video/PDF rendering helpers already exist.
- `PARTIAL` YouTube parsing supports common formats, but there is no single shared `normalizeYouTubeUrl(input)` utility matching the requested contract.
- `MISSING` Live YouTube thumbnail preview is not present in the course builder.
- `PARTIAL` PDF upload exists, but it saves to local `/public/uploads/courses`, not Cloudinary/Firebase.
- `MISSING` Draft/Published toggle is not exposed as such in the admin UI.
- `MISSING` Course thumbnail emoji/image URL support is not present.
- `MISSING` Real module builder with add/reorder/lock rules is not implemented.
- `RISK` The admin UI sends `videoUrls` and `pdfUrls`, but the main course API still persists the older flat `videoUrl` / `pdfUrl` model.
- `MISSING` Course delete is still a hard delete and also removes enrollments. Soft delete with `isDeleted` is not implemented.

### Key files checked

- `app/admin/courses/page.tsx`
- `app/api/admin/courses/route.ts`
- `app/api/admin/courses/[courseId]/route.ts`
- `app/api/admin/upload/route.ts`
- `lib/utils/mediaParser.ts`
- `utils/resourceParser.ts`
- `utils/youtubeParser.ts`
- `lib/db/collections.ts`

### Safe next steps

1. Upgrade the course schema first: add `isDeleted`, `thumbnail`, `videoUrls`, `pdfUrls`, and a real `modules` array.
2. Update the admin course API to read/write the new schema while keeping backward compatibility for older courses.
3. Convert delete into soft delete before touching trainee consumption logic.
4. Add live media previews in the builder after the schema/API layer is stable.
5. Add module reordering and sequential locking only after the new module model is settled.

## 4. Quiz System

### Current status

- `PARTIAL` Admin course builder already supports AI generation, per-question regenerate, manual add, and remove.
- `PARTIAL` Admin builder enforces a 10-question cap in the UI.
- `RISK` Admin builder calls `/api/trainee/practice-quiz/generate` for AI quiz generation, which is the wrong shared route for this responsibility.
- `MISSING` The AI route currently generates 5-question practice quizzes, not a strict 10-question admin quiz payload.
- `MISSING` Retry-on-malformed-JSON / retry-on-fewer-than-10 behavior is not implemented.
- `MISSING` Explanations are not fully represented in the admin quiz card editing experience.
- `MISSING` Drag-and-drop reordering with `@dnd-kit/sortable` is not implemented.
- `PARTIAL` Trainee quiz runner already shows one question at a time with immediate correctness feedback and explanations.
- `MISSING` Practice quiz page still generates 5 questions and does not show all questions at once.
- `MISSING` Practice quiz attempt history is not persisted to MongoDB.
- `MISSING` "Recent Quizzes" table is not present.

### Key files checked

- `app/admin/courses/page.tsx`
- `app/api/trainee/practice-quiz/generate/route.ts`
- `app/trainee/practice-quiz/page.tsx`
- `components/trainee/Quiz/PracticeQuizRunner.tsx`

### Safe next steps

1. Split admin quiz generation away from the trainee practice quiz route.
2. Create a single strict quiz-generation contract for exactly 10 admin questions.
3. Add one automatic retry for malformed JSON or incorrect count.
4. Add explanation editing/display in the admin builder.
5. Add practice-quiz attempt persistence and the "Recent Quizzes" table.
6. Only then change the trainee practice quiz presentation from one-at-a-time to all-at-once.

## 5. Trainee Training View and Sequential Modules

### Current status

- `PARTIAL` Trainee training pages already load course/enrollment data from MongoDB.
- `PARTIAL` The player already supports embedded videos and PDFs.
- `MISSING` Real multi-module progression with sequential locking is not implemented yet.
- `MISSING` Per-module completion flags like `videoWatched`, `pdfViewed`, and `quizPassed` are not stored in MongoDB.
- `MISSING` Notes, bookmarks, and discussion/comments are not implemented in the training data model.
- `PARTIAL` Enrollment tracks `completedModuleIds`, but not the richer per-module state required by the prompt.

### Key files checked

- `components/trainee/CoursePlayer/*`
- `app/api/trainee/training/course/[courseId]/route.ts`
- `app/api/trainee/training/overview/route.ts`
- `app/api/trainee/enrollments/[courseId]/route.ts`
- `lib/db/collections.ts`

### Safe next steps

1. Extend the enrollment model to support per-module status fields.
2. Add module completion APIs without changing the visible player first.
3. Once the data model is stable, layer in the lock/unlock UI and progress bar behavior.
4. Add notes and bookmarks after core completion logic is stable.

## 6. Certificates and Verification

### Current status

- `DONE` Certificate records are being created in MongoDB when a course completion flow reaches completion.
- `DONE` Trainee certificates API loads from MongoDB by session user.
- `DONE` Public verification page and verification API already exist.
- `DONE` PDF download routes already exist and use `pdf-lib`.
- `PARTIAL` Certificate visual design components already include QR and "Blockchain Verified" styling, but the PDF builder is much simpler than the premium UI component.
- `RISK` Public verify API still contains a mock certificate fallback path.
- `PARTIAL` Trainee certificates page is functional, but it is not yet the exact requested table-style experience.
- `MISSING` "Course Completed" celebration modal with preview/view/download actions is not confirmed in the completion flow.

### Key files checked

- `app/api/trainee/enrollments/[courseId]/route.ts`
- `app/api/trainee/certificates/route.ts`
- `app/trainee/certificates/page.tsx`
- `app/api/trainee/certificates/[certNo]/pdf/route.ts`
- `app/api/admin/certificates/[certNo]/pdf/route.ts`
- `app/api/certificates/verify/[certId]/route.ts`
- `app/verify/[certId]/page.tsx`
- `lib/certificates/pdf.ts`
- `components/shared/PremiumCertificate.tsx`

### Safe next steps

1. Remove the mock certificate fallback from the public verify API.
2. Align the generated PDF output more closely with the premium certificate design.
3. Add the completion modal only after the completion API response contract is finalized.

## 7. Dashboard and Profile Refresh After Completion

### Current status

- `PARTIAL` Global trainee stats already pull some live course/certificate information.
- `RISK` Global certificate count falls back to completed-course count if the API omits `certificateCount`.
- `MISSING` Trainee dashboard still uses mock safety tips, achievements, and events.
- `MISSING` Several trainee dashboard KPIs are still hardcoded.
- `RISK` Trainee profile page calls `/api/user/profile`, but the real route present in the repo is `/api/trainee/profile`.
- `MISSING` Real-time/next-load cascade updates across badges, leaderboard, admin activity, and department compliance are not fully centralized yet.

### Key files checked

- `app/trainee/dashboard/page.tsx`
- `context/GlobalStatsContext.tsx`
- `app/trainee/profile/page.tsx`
- `app/api/trainee/profile/route.ts`
- `data/mockTraineeData.ts`

### Safe next steps

1. Fix the profile page API path mismatch first.
2. Replace dashboard hardcoded KPIs with API-backed values.
3. Remove mock dashboard sections one by one after live replacements exist.
4. Centralize completion side-effects into one shared service or completion pipeline.

## 8. Buddy AI and Shared AI Routing

### Current status

- `DONE` Buddy AI is mounted in the admin layout.
- `DONE` `window._buddyLanguage` is being written in the chatbot context.
- `DONE` Bulbul v3 and Saaras v3 are wired in the Sarvam API routes.
- `DONE` Word-cap logic and the "Ask me for more details on any specific step." truncation are present in the Sarvam chat route.
- `PARTIAL` Buddy AI supports language mode, TTS, and ASR, but course-context injection is still not wired through the app.
- `MISSING` The repo does not use a unified `/api/ai` gateway yet.
- `RISK` `/api/ai` currently returns HTTP 410 and points callers to `/api/sarvam/chat`.
- `PARTIAL` Suggested questions can vary by `activeCourseId`, but nothing in the app currently sets that course context.
- `RISK` Admin quiz generation and trainee practice quiz generation are split across other routes instead of a single controlled AI gateway.

### Key files checked

- `context/ChatbotContext.tsx`
- `components/chatbot/*`
- `components/admin/layout/AdminLayout.tsx`
- `app/api/ai/route.ts`
- `app/api/sarvam/chat/route.ts`
- `app/api/sarvam/tts/route.ts`
- `app/api/sarvam/asr/route.ts`

### Safe next steps

1. Decide the single supported AI gateway and migrate callers toward it.
2. Set `activeCourseId` from trainee course pages before changing prompt logic.
3. Move admin quiz generation onto the shared AI layer after the course-context wiring is done.

## 9. Leaderboard, Compliance, Reports

### Current status

- `DONE` Leaderboard page already has department filter, time filter, pagination, and "You" auto-scroll behavior.
- `PARTIAL` Leaderboard API computes points from live data, but the formula is inline and undocumented.
- `MISSING` Shared `POINTS_CONFIG` constant is not defined.
- `RISK` Leaderboard page still falls back to mock `LEADERBOARD_DATA` if the API fails.
- `MISSING` Compliance reporting is still mock-driven and not backed by real department-level actions yet.

### Key files checked

- `app/trainee/leaderboard/page.tsx`
- `app/api/trainee/leaderboard/route.ts`
- `app/admin/compliance/page.tsx`

### Safe next steps

1. Extract the leaderboard points formula into a shared `POINTS_CONFIG`.
2. Remove mock leaderboard fallback once the API is reliable.
3. Replace compliance mock data with department-level live aggregations from MongoDB.

## 10. Highest-Risk Mismatches to Fix First

1. Register page supports phone signup, but register API only supports email signup.
2. Admin course builder collects `videoUrls` and `pdfUrls`, but the course API still persists `videoUrl` and `pdfUrl`.
3. Course delete is destructive and removes enrollments.
4. Main admin dashboard stats are still hardcoded/mock and do not match the rest of the platform.
5. Trainee profile page hits `/api/user/profile`, but the real route is `/api/trainee/profile`.
6. Public certificate verification still contains a mock fallback record.
7. AI quiz generation responsibilities are split across the wrong routes.
8. Practice quiz persistence/history is missing.
9. Course-context-aware Buddy AI is not actually wired.
10. Compliance and announcements are still mostly UI-only.

## 11. Recommended Implementation Order

### Phase 1: Data integrity and route mismatches

1. Fix register flow mismatch.
2. Fix trainee profile API path mismatch.
3. Unify course media fields in schema + API.
4. Add course soft-delete.
5. Remove mock fallback from certificate verification.

### Phase 2: Admin truthfulness

1. Replace dashboard KPIs with Mongo-backed stats.
2. Replace mock admin overview widgets.
3. Make compliance and announcements real.

### Phase 3: Course engine

1. Introduce real module schema.
2. Add module progress tracking in enrollments.
3. Add sequential locking.
4. Add notes/bookmarks.

### Phase 4: Quiz and AI cleanup

1. Separate admin 10-question generation from trainee practice quiz generation.
2. Add strict JSON validation + retry.
3. Move AI calls behind one supported gateway.
4. Add practice quiz history.

### Phase 5: Polish and UX parity

1. Register password toggle.
2. Hero CTA correction.
3. Pure Hindi language mode.
4. Chart labels/tooltips.
5. Completion modal and certificate polish.
