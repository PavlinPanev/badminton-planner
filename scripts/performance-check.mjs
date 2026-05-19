const baseUrl = process.env.BADMINTON_PERFORMANCE_BASE_URL ?? "http://localhost:3000";
const email = process.env.BADMINTON_PERFORMANCE_EMAIL ?? "performance.user1@badminton.test";
const password = process.env.BADMINTON_PERFORMANCE_PASSWORD ?? "pass123";

const checks = [];

async function timedRequest(label, path, options = {}) {
  const started = performance.now();
  const response = await fetch(`${baseUrl}${path}`, options);
  const elapsedMs = Math.round(performance.now() - started);
  const contentType = response.headers.get("content-type") ?? "";
  const body = contentType.includes("application/json") ? await response.json() : await response.text();

  checks.push({
    label,
    path,
    status: response.status,
    elapsedMs,
  });

  if (!response.ok) {
    const detail = typeof body === "string" ? body.slice(0, 240) : JSON.stringify(body).slice(0, 240);
    throw new Error(`${label} failed with ${response.status}: ${detail}`);
  }

  return body;
}

async function main() {
  console.log(`Performance API check against ${baseUrl}`);
  console.log(`Login user: ${email}`);

  const login = await timedRequest("POST /api/auth/login", "/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const token = login?.token;

  if (!token) {
    throw new Error("Login response did not include a token.");
  }

  const authHeaders = { authorization: `Bearer ${token}` };
  const sessions = await timedRequest("GET /api/sessions", "/api/sessions?page=1&pageSize=20", {
    headers: authHeaders,
  });

  await timedRequest("GET /api/events", "/api/events?page=1&pageSize=20", {
    headers: authHeaders,
  });

  await timedRequest("GET /api/announcements", "/api/announcements?page=1&pageSize=20", {
    headers: authHeaders,
  });

  const firstSessionId = sessions?.data?.[0]?.id;

  if (firstSessionId) {
    await timedRequest("GET /api/sessions/[id]", `/api/sessions/${firstSessionId}`, {
      headers: authHeaders,
    });
    await timedRequest("GET /api/sessions/[id]/comments", `/api/sessions/${firstSessionId}/comments?page=1&pageSize=20`, {
      headers: authHeaders,
    });
  } else {
    checks.push({
      label: "GET /api/sessions/[id]",
      path: "/api/sessions/{first-session}",
      status: "skipped",
      elapsedMs: 0,
    });
    checks.push({
      label: "GET /api/sessions/[id]/comments",
      path: "/api/sessions/{first-session}/comments?page=1&pageSize=20",
      status: "skipped",
      elapsedMs: 0,
    });
  }

  console.table(checks);

  const result = {
    measuredAt: new Date().toISOString(),
    baseUrl,
    email,
    checks,
  };

  const { mkdir, writeFile } = await import("node:fs/promises");
  await mkdir("docs/assessments", { recursive: true });
  await writeFile("docs/assessments/performance-check-latest.json", `${JSON.stringify(result, null, 2)}\n`);

  console.log("Wrote docs/assessments/performance-check-latest.json");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
