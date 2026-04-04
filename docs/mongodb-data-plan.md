# MongoDB Data Plan (Low Memory + Privacy)

## 1) What to store

Use only required fields for core flows:

- Login / Signup:
  - users: name, email or phone, passwordHash (never password), role, status timestamps.
  - sessions: tokenHash, userId, expiresAt, optional userAgent/ipHash.
  - otp_challenges: phone, otpHash, attempts, expiresAt (TTL).
- Course creation and assignment:
  - courses: code, title, version, modulesCount, publish status.
  - enrollments: userId, courseId, progressPct, completedModuleIds, status.
- Certificates:
  - certificates: certNo, userId, courseId, score, issuedAt, expiresAt, status, verificationHash.

## 2) Privacy controls

- Never store API keys in browser localStorage.
- Never store raw password, OTP, or session token.
- Store only hashes for password, OTP, and session token.
- Avoid saving chat transcripts by default. Save only if audit/compliance requires it.
- If storing PII, keep minimal fields and add retention policy.

## 3) Memory optimization

- Keep documents narrow (avoid duplicated names in enrollments/certificates).
- Reference by userId/courseId instead of embedding large objects.
- Add indexes for exact access paths.
- Use TTL indexes for ephemeral data.
- Paginate list endpoints (limit + cursor) instead of loading full collections.

## 4) Required indexes

- users:
  - unique(email) sparse
  - unique(phone) sparse
- courses:
  - unique(code)
  - index(isPublished)
- enrollments:
  - unique(userId, courseId)
  - index(courseId, status)
- certificates:
  - unique(certNo)
  - index(userId)
  - unique(verificationHash)
- sessions:
  - index(userId)
  - TTL(expiresAt)
- otp_challenges:
  - index(phone)
  - TTL(expiresAt)

## 5) Suggested retention

- otp_challenges: 5 to 10 minutes TTL
- sessions: 7 to 30 days TTL
- enrollments/certificates: long-term business records
- failed auth logs: 30 to 90 days

## 6) Minimal payload examples

User document:

```json
{
  "fullName": "Ravi Gupta",
  "phone": "9876543210",
  "passwordHash": "<bcrypt-hash>",
  "role": "trainee",
  "isActive": true,
  "createdAt": "2026-03-24T00:00:00.000Z",
  "updatedAt": "2026-03-24T00:00:00.000Z"
}
```

Enrollment document:

```json
{
  "userId": "usr_123",
  "courseId": "crs_001",
  "progressPct": 35,
  "completedModuleIds": ["m1", "m2"],
  "status": "in_progress",
  "assignedAt": "2026-03-24T00:00:00.000Z",
  "updatedAt": "2026-03-24T00:00:00.000Z"
}
```

Certificate document:

```json
{
  "certNo": "KS-CERT-2026-0001",
  "userId": "usr_123",
  "courseId": "crs_001",
  "score": 89,
  "status": "valid",
  "issuedAt": "2026-03-24T00:00:00.000Z",
  "verificationHash": "<sha256>"
}
```
