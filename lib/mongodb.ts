import { MongoClient, ServerApiVersion } from 'mongodb';
import { COLLECTIONS } from '@/lib/db/collections';

function parsePositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value || '', 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
}

const maxPoolSize = parsePositiveInt(process.env.MONGODB_MAX_POOL_SIZE, 50);
const minPoolSize = parsePositiveInt(process.env.MONGODB_MIN_POOL_SIZE, 10);
const maxIdleTimeMS = parsePositiveInt(process.env.MONGODB_MAX_IDLE_MS, 45000);
const connectTimeoutMS = parsePositiveInt(process.env.MONGODB_CONNECT_TIMEOUT_MS, 10000);
const socketTimeoutMS = parsePositiveInt(process.env.MONGODB_SOCKET_TIMEOUT_MS, 45000);
const serverSelectionTimeoutMS = parsePositiveInt(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS, 12000);

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  appName: 'karmasetu-web',
  maxPoolSize,
  minPoolSize,
  maxIdleTimeMS,
  connectTimeoutMS,
  socketTimeoutMS,
  serverSelectionTimeoutMS,
  retryWrites: true,
};

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient> | undefined;
let indexesInitPromise: Promise<void> | undefined;

async function waitForWithTimeout(promise: Promise<void>, timeoutMs: number): Promise<boolean> {
  if (timeoutMs <= 0) {
    await promise;
    return true;
  }

  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<boolean>((resolve) => {
    timeoutHandle = setTimeout(() => resolve(false), timeoutMs);
  });

  const result = await Promise.race([
    promise.then(() => true).catch(() => false),
    timeoutPromise,
  ]);

  if (timeoutHandle) {
    clearTimeout(timeoutHandle);
  }

  return result;
}

async function ensureIndexes(client: MongoClient, dbName: string) {
  const db = client.db(dbName);

  await Promise.all([
    db.collection(COLLECTIONS.users).createIndexes([
      { key: { email: 1 }, name: 'users_email_lookup' },
      { key: { email: 1, role: 1 }, name: 'users_email_role_lookup' },
      { key: { phone: 1 }, name: 'users_phone_lookup', sparse: true },
      { key: { createdAt: -1 }, name: 'users_created_at_desc' },
    ]),
    db.collection(COLLECTIONS.sessions).createIndexes([
      { key: { tokenFingerprint: 1 }, name: 'sessions_token_fingerprint' },
      { key: { userId: 1, expiresAt: -1 }, name: 'sessions_user_expires' },
      { key: { expiresAt: 1 }, name: 'sessions_ttl', expireAfterSeconds: 0 },
    ]),
    db.collection(COLLECTIONS.authAudit).createIndexes([
      { key: { createdAt: -1 }, name: 'auth_audit_created' },
      { key: { identifier: 1, createdAt: -1 }, name: 'auth_audit_identifier_created' },
    ]),
    db.collection(COLLECTIONS.enrollments).createIndexes([
      { key: { userId: 1, courseId: 1 }, name: 'enrollments_user_course_unique', unique: true },
      { key: { userId: 1, updatedAt: -1 }, name: 'enrollments_user_updated' },
      { key: { createdAt: -1 }, name: 'enrollments_created' },
      { key: { userId: 1, status: 1 }, name: 'enrollments_user_status' },
      { key: { courseId: 1, status: 1 }, name: 'enrollments_course_status' },
      { key: { updatedAt: -1 }, name: 'enrollments_updated' },
    ]),
    db.collection(COLLECTIONS.courses).createIndexes([
      { key: { deadline: 1 }, name: 'courses_deadline' },
      { key: { isPublished: 1, isDeleted: 1, createdAt: -1 }, name: 'courses_publish_deleted_created' },
    ]),
    db.collection(COLLECTIONS.certificates).createIndexes([
      {
        key: { userId: 1, courseId: 1 },
        name: 'cert_user_course_active_unique',
        unique: true,
        partialFilterExpression: { status: { $ne: 'revoked' } },
      },
      { key: { issuedAt: -1 }, name: 'cert_issued' },
      { key: { userId: 1, status: 1, issuedAt: -1 }, name: 'cert_user_status_issued' },
      { key: { certNo: 1 }, name: 'cert_cert_no' },
    ]),
    db.collection(COLLECTIONS.traineeFeedback).createIndexes([
      { key: { status: 1, createdAt: -1 }, name: 'feedback_status_created' },
      { key: { createdAt: -1 }, name: 'feedback_created' },
    ]),
    db.collection(COLLECTIONS.adminNotifications).createIndexes([
      { key: { status: 1, createdAt: -1 }, name: 'admin_notifications_status_created' },
      { key: { createdAt: -1 }, name: 'admin_notifications_created' },
    ]),
    db.collection(COLLECTIONS.adminAnnouncements).createIndexes([
      { key: { status: 1, createdAt: -1 }, name: 'admin_announcements_status_created' },
      { key: { priority: 1, createdAt: -1 }, name: 'admin_announcements_priority_created' },
      { key: { scheduledAt: 1 }, name: 'admin_announcements_scheduled_at' },
    ]),
  ]);
}

function createClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('Missing MONGODB_URI in environment variables.');
  }

  const client = new MongoClient(uri, options);
  return client.connect();
}

if (process.env.NODE_ENV === 'development') {
  clientPromise = global._mongoClientPromise;
} else {
  clientPromise = undefined;
}

export async function getMongoClient(): Promise<MongoClient> {
  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      global._mongoClientPromise = createClientPromise();
    }

    clientPromise = global._mongoClientPromise;
  } else if (!clientPromise) {
    clientPromise = createClientPromise();
  }

  if (!clientPromise) {
    throw new Error('MongoDB client is not initialized.');
  }

  return clientPromise;
}

export async function getMongoDb(dbName?: string) {
  const connectedClient = await getMongoClient();
  const effectiveDbName = dbName || process.env.MONGODB_DB_NAME;

  if (!effectiveDbName) {
    throw new Error('Missing MONGODB_DB_NAME in environment variables.');
  }

  if (!indexesInitPromise) {
    indexesInitPromise = ensureIndexes(connectedClient, effectiveDbName).catch((error) => {
      if (process.env.NODE_ENV !== 'production') {
        console.error('MongoDB index initialization warning:', error);
      }
    });
  }

  const shouldBlockForIndexes = process.env.MONGODB_BLOCK_ON_INDEX_INIT === 'true';
  if (shouldBlockForIndexes) {
    await indexesInitPromise;
  } else {
    // Avoid first-request cold-start stalls in production while still initializing indexes.
    await waitForWithTimeout(indexesInitPromise, parsePositiveInt(process.env.MONGODB_INDEX_INIT_WAIT_MS, 1200));
  }

  return connectedClient.db(effectiveDbName);
}

export default clientPromise;
