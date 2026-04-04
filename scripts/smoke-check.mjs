const BASE_URL = process.env.SMOKE_BASE_URL || 'http://localhost:3000';
const COOKIE_HEADER = process.env.SMOKE_COOKIE || '';
const MAX_HEALTH_MS = Number.parseInt(process.env.SMOKE_MAX_HEALTH_MS || '4000', 10);
const MAX_MONGO_PING_MS = Number.parseInt(process.env.SMOKE_MAX_MONGO_PING_MS || '6000', 10);
const MAX_TRAINEE_DASHBOARD_MS = Number.parseInt(process.env.SMOKE_MAX_TRAINEE_DASHBOARD_MS || '5000', 10);
const MAX_ADMIN_DASHBOARD_MS = Number.parseInt(process.env.SMOKE_MAX_ADMIN_DASHBOARD_MS || '5000', 10);

const PERF_LIMITS = {
  '/api/health': MAX_HEALTH_MS,
  '/api/mongodb/ping': MAX_MONGO_PING_MS,
  '/trainee/dashboard': MAX_TRAINEE_DASHBOARD_MS,
  '/admin/dashboard': MAX_ADMIN_DASHBOARD_MS,
};

const ENABLE_WARMUP = process.env.SMOKE_ENABLE_WARMUP !== 'false';

function buildHeaders(extra = {}) {
  const headers = { ...extra };
  if (COOKIE_HEADER) {
    headers.Cookie = COOKIE_HEADER;
  }
  return headers;
}

async function check(path, expectedStatuses = [200]) {
  const start = Date.now();
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: buildHeaders(),
    redirect: 'manual',
  });
  const elapsed = Date.now() - start;
  const ok = expectedStatuses.includes(response.status);

  return {
    path,
    status: response.status,
    elapsed,
    ok,
  };
}

async function warmup(path) {
  try {
    await fetch(`${BASE_URL}${path}`, {
      headers: buildHeaders(),
      redirect: 'manual',
    });
  } catch {
    // Warmup failures are ignored; measured checks below remain strict.
  }
}

async function run() {
  const checks = [
    ['/api/health', [200, 503]],
    ['/api/mongodb/ping', [200, 500]],
    ['/api/auth/me', [200, 401]],
    ['/trainee/dashboard', [200, 307, 308]],
    ['/admin/dashboard', [200, 307, 308]],
    ['/api/trainee/training/overview', [200, 401, 403]],
    ['/api/admin/overview/stats', [200, 401, 403]],
  ];

  if (ENABLE_WARMUP) {
    console.log('Running warmup pass...');
    for (const [path] of checks) {
      await warmup(path);
    }
  }

  const results = [];
  for (const [path, statuses] of checks) {
    results.push(await check(path, statuses));
  }

  const failed = results.filter((item) => !item.ok);
  const perfFailed = results.filter((item) => {
    const limit = PERF_LIMITS[item.path];
    return typeof limit === 'number' && item.elapsed > limit;
  });

  console.log('--- Smoke Check Results ---');
  for (const item of results) {
    console.log(`${item.ok ? 'OK  ' : 'FAIL'} ${item.path} -> ${item.status} (${item.elapsed}ms)`);
  }

  if (perfFailed.length > 0) {
    console.error('--- Performance Threshold Failures ---');
    for (const item of perfFailed) {
      const limit = PERF_LIMITS[item.path];
      console.error(`SLOW ${item.path} -> ${item.elapsed}ms (limit ${limit}ms)`);
    }
  }

  if (failed.length > 0 || perfFailed.length > 0) {
    if (failed.length > 0) {
      console.error(`Smoke checks failed: ${failed.length}`);
    }
    if (perfFailed.length > 0) {
      console.error(`Performance thresholds failed: ${perfFailed.length}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log('All smoke checks passed.');
}

run().catch((error) => {
  console.error('Smoke check crashed:', error instanceof Error ? error.message : error);
  process.exit(1);
});
