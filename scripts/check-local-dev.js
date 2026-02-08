#!/usr/bin/env node

const targets = [
  { name: "Web", url: "http://localhost:3000" },
  { name: "API", url: "http://localhost:5000/api/health" },
];

const timeoutMs = 60000;
const intervalMs = 1500;

async function checkUrl(url) {
  try {
    const res = await fetch(url, { redirect: "follow" });
    return { ok: res.status < 500, status: res.status };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

async function waitForTarget(target, startedAt) {
  while (Date.now() - startedAt < timeoutMs) {
    const result = await checkUrl(target.url);
    if (result.ok) {
      console.log("[OK] " + target.name + " reachable at " + target.url + " (status " + result.status + ")");
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  console.error("[FAIL] " + target.name + " not reachable at " + target.url + " within " + timeoutMs / 1000 + "s");
  return false;
}

async function main() {
  console.log("Checking local dev services...");
  const startedAt = Date.now();
  let allOk = true;

  for (const target of targets) {
    const ok = await waitForTarget(target, startedAt);
    allOk = allOk && ok;
  }

  if (!allOk) {
    console.error("One or more local services are down. Start them with: npm run dev:start");
    process.exit(1);
  }

  console.log("All local services are reachable.");
}

main();
