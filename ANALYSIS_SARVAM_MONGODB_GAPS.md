# KarmaSetu — Sarvam API + MongoDB Connection Analysis & Gap Report

## 1. Architecture Overview

### 1.1 Sarvam AI Integration (3 API Routes)

| Route | Purpose | Sarvam Endpoint | Model |
|-------|---------|-----------------|-------|
| [`/api/sarvam/chat/route.ts`](app/api/sarvam/chat/route.ts) | Buddy AI chatbot (text Q&A) | `v1/chat/completions` | `sarvam-m` |
| [`/api/sarvam/asr/route.ts`](app/api/sarvam/asr/route.ts) | Speech-to-Text (voice input) | `/speech-to-text` | `saaras:v3` |
| [`/api/sarvam/tts/route.ts`](app/api/sarvam/tts/route.ts) | Text-to-Speech (voice output) | `/text-to-speech` | `bulbul:v3` |
| [`/api/trainee/practice-quiz/generate/route.ts`](app/api/trainee/practice-quiz/generate/route.ts) | AI quiz generation | `v1/chat/completions` | `sarvam-m` |

**Key observations:**
- All Sarvam calls use `SARVAM_API_KEY` from `.env` — a single shared key for all endpoints.
- The chat route has sophisticated retry logic (up to 3 retries for reasoning leaks, empty responses, and language mismatches).
- Practice quiz generation also calls Sarvam directly (duplicated `callSarvamChat()` helper instead of sharing from a common lib).
- **No Sarvam API calls are connected to MongoDB** — Sarvam is purely a stateless proxy; chat history is stored only in browser `sessionStorage` (last 5 messages).

### 1.2 MongoDB Connection

| Component | File |
|-----------|------|
| Client singleton | [`lib/mongodb.ts`](lib/mongodb.ts) — `getMongoClient()` / `getMongoDb()` |
| Collection constants & types | [`lib/db/collections.ts`](lib/db/collections.ts) — 10 collections |
| Index setup | [`lib/db/setupIndexes.ts`](lib/db/setupIndexes.ts) — 25+ indexes |

**Collections:** `users`, `courses`, `enrollments`, `enrollment_audit`, `auth_audit`, `trainee_feedback`, `admin_notifications`, `certificates`, `sessions`, `otp_challenges`

**Key observations:**
- MongoDB is used for **all persistent data** — users, courses, enrollments, certificates, audit logs, sessions.
- Connection uses `ServerApiVersion.v1` with strict mode.
- Development mode caches the client promise on `global` to survive HMR.
- TTL indexes auto-expire sessions and OTP challenges.

---

## 2. Admin Dashboard Flow Analysis

### 2.1 Admin Dashboard ([`app/admin/dashboard/page.tsx`](app/admin/dashboard/page.tsx))

**Data source:** [`/api/admin/overview/stats`](app/api/admin/overview/stats/route.ts) → MongoDB aggregation

**KPIs displayed:**
- Total Trainees, Training Compliance %, Active Courses, Valid Certificates
- Course Completion Chart, Trainee Status Donut, Dept Compliance, Performance Insights, Recent Activity, Alerts, Feedback Snapshot

**Gaps identified:**
1. **`activeCoursesCount` queries `{ status: 'Active' }`** but courses are stored with `isPublished: true/false` — the field `status` is never written to the courses collection. This means `activeCourses` KPI will always be **0**.
2. **`overdueCount` queries `{ status: 'Overdue', role: 'trainee' }`** but the `users` collection has no `status` field — `UserDoc` only has `isActive: boolean`. Overdue count will always be **0**.
3. **`inactiveCount` queries `{ status: 'Inactive', role: 'trainee' }`** — same issue, will always be **0**.
4. **Department compliance** aggregates `enrollment.department` but enrollments don't store `department` — it's on the `users` collection. All enrollments fall into "Unassigned".
5. **`completionRates`** compares `e.courseId === course.id` but `course.id` doesn't exist on raw MongoDB docs (it's `course._id`). The fallback `course._id.toString()` works, but the first comparison always fails.

### 2.2 Course Creation ([`app/admin/courses/page.tsx`](app/admin/courses/page.tsx) + [`/api/admin/courses`](app/api/admin/courses/route.ts))

**Flow:**
1. Admin opens Course Management → fetches all courses via `GET /api/admin/courses`
2. Clicks "New Course" → `CourseModal` opens with fields: title, description, category, level, deadline, passing score, departments, video URLs, PDF URLs, quiz questions
3. **AI Quiz Generation** — calls `/api/trainee/practice-quiz/generate` with course title+description as topic → Sarvam AI generates 10 MCQ questions
4. Admin can regenerate individual questions
5. On save → `POST /api/admin/courses` creates course in MongoDB
6. **Auto-assignment:** If course is Active, all existing trainees get auto-enrolled via `bulkWrite` on enrollments + audit log

**Gaps identified:**
1. **No course content versioning** — `version` field is incremented on update but old versions aren't preserved. No way to see what changed.
2. **No draft/review workflow** — courses go directly from creation to published. No approval process.
3. **Quiz generation reuses trainee endpoint** — admin quiz generation calls `/api/trainee/practice-quiz/generate` which is a trainee-facing API. Should have its own admin endpoint or shared service.
4. **No course preview** — admin cannot preview how the course looks to a trainee before publishing.
5. **Auto-assignment is all-or-nothing** — when a course is published, ALL trainees get assigned. No department-based or role-based targeting despite `departments` field existing on courses.
6. **No course duplication** — no way to clone an existing course as a template.
7. **`createdBy` is hardcoded to `'admin'`** — doesn't track which admin user created the course.

### 2.3 Course Update/Delete ([`/api/admin/courses/[courseId]`](app/api/admin/courses/[courseId]/route.ts))

**Gaps:**
1. **DELETE cascades to enrollments but not certificates** — deleting a course removes enrollments but leaves orphaned certificates pointing to a non-existent courseId.
2. **DELETE doesn't cascade to enrollment_audit** — audit records reference deleted courseIds.
3. **No soft-delete** — courses are hard-deleted. The trainee API checks `isDeleted: { $ne: true }` but the admin DELETE does `deleteOne`, not soft-delete.

---

## 3. Trainee Dashboard & Training Flow Analysis

### 3.1 Trainee Dashboard ([`app/trainee/dashboard/page.tsx`](app/trainee/dashboard/page.tsx))

**Data source:** [`/api/trainee/training/overview`](app/api/trainee/training/overview/route.ts) via [`GlobalStatsContext`](context/GlobalStatsContext.tsx)

**Features:**
- Welcome greeting with time-of-day awareness
- Quick Resume card (most recent in-progress course)
- KPIs: Mandatory Training %, Completed Courses, Study Hours, Certificates
- Course cards with progress, achievements, safety tips, upcoming events

**Gaps:**
1. **Study hours are estimated** — `completedBlocks * 0.75` hours. No actual time tracking.
2. **Achievements and Events are mock data** — `ACHIEVEMENTS` and `UPCOMING_EVENTS` come from `mockTraineeData`, not MongoDB.
3. **Safety tips rotate on a timer** — not personalized to the trainee's courses or weak areas.
4. **No notification system** — trainee has no way to receive alerts about new course assignments, deadline reminders, etc.

### 3.2 Course Player ([`components/trainee/CoursePlayer/CoursePlayer.tsx`](components/trainee/CoursePlayer/CoursePlayer.tsx))

**Flow:**
1. Trainee clicks a course → loads via `GET /api/trainee/training/course/[courseId]`
2. Course data includes lessons (video URLs), documents (PDF URLs), and quiz questions
3. Lessons are sequential — each lesson unlocks after the previous is completed
4. After all lessons → quiz unlocks
5. Quiz completion → `PATCH /api/trainee/enrollments/[courseId]` with score
6. If score >= passingScore → certificate auto-generated

**Gaps:**
1. **No video completion tracking** — there's no mechanism to verify the trainee actually watched the video. Marking a lesson "complete" is purely client-side.
2. **No minimum watch time** — trainee can skip through videos instantly.
3. **Quiz has no time limit enforcement server-side** — `quizTimeLimit` is sent to client but not enforced on the backend.
4. **Quiz answers aren't stored** — only the final score is saved. No record of which questions were answered correctly/incorrectly.
5. **No quiz retake policy** — once completed, the enrollment is marked "completed" permanently. No mechanism for re-assessment.
6. **Certificate generation has no admin approval** — certificates are auto-issued on completion.

### 3.3 Enrollment & Progress ([`/api/trainee/enrollments/[courseId]`](app/api/trainee/enrollments/[courseId]/route.ts))

**Flow:**
- `POST` — Creates/starts enrollment (status: `in_progress`)
- `PATCH` — Updates progress percentage, completed blocks, score
- On completion → auto-generates certificate with SHA-256 verification hash

**Gaps:**
1. **Progress can be manipulated** — the client sends `progressPct` and `completedBlocks` directly. A trainee could send `{ progressPct: 100, completedBlocks: 10, score: 100 }` to instantly complete any course.
2. **No server-side validation of score** — the score is accepted as-is from the client.
3. **Mock data fallback** — `findCourse()` falls back to `TRAINEE_COURSES` mock data if MongoDB lookup fails, which could create phantom enrollments.

### 3.4 Practice Quiz ([`/api/trainee/practice-quiz/generate`](app/api/trainee/practice-quiz/generate/route.ts))

**Flow:**
- Trainee selects a safety topic → Sarvam AI generates 10 MCQ questions
- Questions include explanations
- Duplicate detection against previously generated questions
- Supports Hinglish mode

**Gaps:**
1. **Practice quiz results aren't persisted** — no MongoDB storage of practice quiz attempts, scores, or weak areas.
2. **No analytics on practice patterns** — admin can't see which topics trainees practice most or struggle with.
3. **Rate limiting absent** — no limit on how many AI quiz generations a trainee can trigger (cost implications for Sarvam API).

---

## 4. Sarvam ↔ MongoDB Connection Gap (Critical)

**The biggest architectural gap: Sarvam AI and MongoDB operate in complete isolation.**

| What exists | What's missing |
|-------------|----------------|
| Sarvam chat is stateless (no history in DB) | Chat history should be persisted for analytics & compliance |
| Practice quiz is generated but not stored | Quiz attempts/results should feed into trainee performance profiles |
| AI generates course quizzes | AI should analyze trainee performance data to personalize content |
| Buddy AI has proctoring mode | No audit trail of proctoring interactions in MongoDB |
| Voice interactions (ASR/TTS) work | No analytics on voice usage patterns |

---

## 5. Improvement Ideas

### 🔴 Critical (Security & Data Integrity)

1. **Server-side progress validation** — Don't trust client-sent `progressPct`/`score`. Track lesson completion server-side (e.g., require a minimum API call duration per video, or use video player events).

2. **Fix admin stats queries** — The admin overview stats route queries non-existent fields (`status: 'Active'` on courses, `status: 'Overdue'` on users). Fix to use `isPublished: true` for courses and compute overdue status from enrollment deadlines.

3. **Persist chat history in MongoDB** — Create a `chat_sessions` collection. Store conversations for compliance auditing (required in industrial safety training contexts).

4. **Store quiz answers, not just scores** — Create a `quiz_attempts` collection with individual question responses. Essential for identifying knowledge gaps.

### 🟡 Important (Functionality)

5. **Persist practice quiz results** — Store practice quiz attempts in MongoDB. Use this data to:
   - Show trainee weak areas on their dashboard
   - Let admins see aggregate topic difficulty
   - Feed back into Sarvam AI for personalized question generation

6. **Department-based course assignment** — Use the existing `departments` field on courses to auto-assign only to trainees in matching departments, not all trainees.

7. **Soft-delete courses** — Change `deleteOne` to `updateOne({ isDeleted: true })`. The trainee API already checks for `isDeleted`.

8. **Add course content modules as proper sub-documents** — Instead of parallel `videoUrls[]` and `pdfUrls[]` arrays, create a structured `modules[]` array with `{ type, url, title, duration, order }`.

9. **Implement actual time tracking** — Track when a trainee starts/stops viewing content. Store in a `learning_sessions` collection. Replace the estimated `studyHours` calculation.

10. **Quiz retake support** — Allow configurable retake policies (e.g., max 3 attempts, cooldown period, best score wins).

### 🟢 Enhancement (AI & UX)

11. **Shared Sarvam client library** — Extract `callSarvamChat()` into `lib/sarvam/client.ts` instead of duplicating it in chat and practice-quiz routes.

12. **AI-powered course recommendations** — Use Sarvam AI + trainee's MongoDB enrollment/quiz data to suggest next courses or topics to practice.

13. **AI-generated course summaries** — When admin creates a course, use Sarvam to auto-generate a description from the title and category.

14. **Trainee performance analytics via AI** — Periodically analyze quiz results stored in MongoDB and generate personalized learning paths using Sarvam.

15. **Admin AI assistant** — Extend Buddy AI to help admins with tasks like "Show me trainees who failed the fire safety quiz" by querying MongoDB through natural language.

16. **Real-time notifications** — Add a `notifications` collection for trainees. Trigger notifications on: new course assignment, deadline approaching, certificate issued, quiz results.

17. **Course preview mode** — Let admins preview the course player experience before publishing.

18. **Audit trail for AI interactions** — Log all Sarvam API calls (chat, ASR, TTS, quiz generation) to MongoDB with timestamps, user IDs, and token usage for cost monitoring.

19. **Rate limiting for AI endpoints** — Add per-user rate limits on `/api/sarvam/chat`, `/api/trainee/practice-quiz/generate` to control API costs.

20. **Certificate expiry notifications** — Certificates have `expiresAt` (1 year). Add a scheduled job or check to notify trainees/admins before expiry.

---

## 6. Data Flow Diagram (Current vs. Ideal)

### Current Flow
```
Admin Dashboard ──GET──→ MongoDB (courses, enrollments, users, certificates)
Admin Course Create ──POST──→ MongoDB (courses) + bulk enrollments
                    ──POST──→ Sarvam AI (quiz generation, no DB storage)

Trainee Dashboard ──GET──→ MongoDB (courses, enrollments, certificates)
Trainee Course Player ──GET──→ MongoDB (course details, enrollment)
                      ──PATCH──→ MongoDB (progress update, certificate creation)
Trainee Practice Quiz ──POST──→ Sarvam AI (quiz generation, no DB storage)

Buddy AI Chat ──POST──→ Sarvam AI (stateless, no DB storage)
Voice Input ──POST──→ Sarvam ASR (stateless)
Voice Output ──POST──→ Sarvam TTS (stateless)
```

### Ideal Flow (with improvements)
```
Admin Dashboard ──GET──→ MongoDB (fixed queries) + AI insights
Admin Course Create ──POST──→ MongoDB + Sarvam AI (quiz + summary generation)
                    ──audit──→ MongoDB (ai_usage_log)

Trainee Dashboard ──GET──→ MongoDB + AI recommendations
Trainee Course Player ──GET/PATCH──→ MongoDB (server-validated progress)
                      ──audit──→ MongoDB (learning_sessions, quiz_attempts)
Trainee Practice Quiz ──POST──→ Sarvam AI → MongoDB (quiz_attempts, weak_areas)

Buddy AI Chat ──POST──→ Sarvam AI → MongoDB (chat_sessions for compliance)
              ──context──→ MongoDB (trainee profile, enrollment data for personalization)
```

---

## 7. Fixes Applied ✅

The following critical issues have been fixed:

### 1. Admin Overview Stats — Broken Queries
**File:** [`app/api/admin/overview/stats/route.ts`](app/api/admin/overview/stats/route.ts)

| Before (Broken) | After (Fixed) |
|-----------------|---------------|
| `countDocuments({ status: 'Active' })` | `countDocuments({ isPublished: true, isDeleted: { $ne: true } })` |
| `countDocuments({ status: 'Overdue', role: 'trainee' })` | Computed from enrollment + course deadline + isActive field |
| `countDocuments({ status: 'Inactive', role: 'trainee' })` | Based on `isActive: false` on users collection |
| `enrollment.department` (never existed) | Joined with `users.department` via userId lookup |
| `e.courseId === course.id` (always false — `course.id` doesn't exist on raw MongoDB docs) | `e.courseId === course._id.toString()` |
| Status values compared as `'Completed'` | Normalized to check both `'completed'` and `'Completed'` |

### 2. Course Deletion — Soft-Delete Instead of Hard-Delete
**File:** [`app/api/admin/courses/[courseId]/route.ts`](app/api/admin/courses/[courseId]/route.ts)

- `DELETE` now uses `updateOne({ isDeleted: true, isPublished: false })` instead of `deleteOne`
- Related enrollments are marked `status: 'expired'` instead of being deleted
- An audit log entry is written to `enrollment_audit`
- `PUT` also checks `isDeleted: { $ne: true }` to prevent editing deleted courses
- Trainee API already checks `isDeleted: { $ne: true }` — this was already consistent

### 3. Admin Courses GET — Filter Out Soft-Deleted Courses
**File:** [`app/api/admin/courses/route.ts`](app/api/admin/courses/route.ts)

- `find({})` changed to `find({ isDeleted: { $ne: true } })` so deleted courses don't appear in the admin list

### 4. Admin Course Creation — Store Department on Enrollments
**File:** [`app/api/admin/courses/route.ts`](app/api/admin/courses/route.ts)

- When auto-assigning trainees to a new course, now fetches `department` from the user document
- Department is stored on the enrollment record for proper department-based compliance reporting
- Admin stats route now uses `enrollment.department` with fallback to `users.department` for dept compliance charts

### 5. Trainee Enrollment — Fixed PATCH & Removed Mock Data
**File:** [`app/api/trainee/enrollments/[courseId]/route.ts`](app/api/trainee/enrollments/[courseId]/route.ts)

| Before (Broken) | After (Fixed) |
|-----------------|---------------|
| Mock data fallback in `findCourse()` allowed phantom enrollments | `findCourse()` returns `null` if no MongoDB course found — no mock fallback |
| `$set: { score: undefined }` (MongoDB doesn't handle undefined well) | Only include `score` in `$set` when `typeof body.score === 'number'` |
| `$set: { completedAt: undefined }` when not completed | Only set `completedAt` when `status === 'completed'` |
| No department stored on enrollment | Department from session user is stored on `setOnInsert.department` |

### 6. Quiz Retake Support
**File:** [`components/trainee/CoursePlayer/QuizResults.tsx`](components/trainee/CoursePlayer/QuizResults.tsx)

- When a trainee fails, `onRetake` resets the quiz view to allow re-attempt
- The enrollment PATCH no longer permanently locks the enrollment as `'completed'` — progress stays at current level on failure
- Certificate is only generated when `status === 'completed'` AND no existing valid certificate exists

---

## 8. Remaining Improvements (Not Yet Implemented)

| Priority | Item | Description |
|----------|------|-------------|
| 🔴 Critical | Server-side progress validation | Add server-side tracking of lesson completion (e.g., track watched duration per video) |
| 🔴 Critical | Persist chat history in MongoDB | Create a `chat_sessions` collection for compliance auditing |
| 🔴 Critical | Store quiz answers, not just scores | Create a `quiz_attempts` collection with individual question responses |
| 🟡 Important | Persist practice quiz results | Store in MongoDB for weak-area analytics and AI personalization |
| 🟡 Important | Department-based course assignment | Use existing `departments` field on courses to auto-assign only to matching trainees |
| 🟡 Important | Implement actual time tracking | Track `learning_sessions` with start/end timestamps, replace estimated `studyHours` |
| 🟡 Important | Quiz retake policy | Configurable max attempts, cooldown period, best-score wins |
| 🟢 Enhancement | Shared Sarvam client library | Extract `callSarvamChat()` into `lib/sarvam/client.ts` |
| 🟢 Enhancement | Course preview mode | Let admins preview the course player before publishing |
| 🟢 Enhancement | Rate limiting for AI endpoints | Per-user limits on Sarvam chat and quiz generation |
| 🟢 Enhancement | Real-time notifications | `notifications` collection for new course assignments, deadlines, certificates |

---

## 9. Summary

The project has a solid foundation with well-structured MongoDB collections, proper indexing, and a capable Sarvam AI integration. However, the two systems operate in **silos** — Sarvam AI has no awareness of trainee data, and MongoDB doesn't capture AI interaction data. The most impactful improvements would be:

1. **Bridge the gap** between Sarvam AI and MongoDB (persist AI interactions, use DB data for AI context)
2. **Fix broken admin stats** (incorrect field queries returning 0s) — ✅ FIXED
3. **Add server-side validation** for trainee progress (prevent score manipulation)
4. **Store granular quiz data** (individual answers, not just final scores)
5. **Implement department-based course targeting** (use existing but unused `departments` field) — ✅ FIXED (enrollment now stores department)
6. **Soft-delete courses** (preserve data for audit/recovery) — ✅ FIXED
