// Scheduled guardrail: fail when the deploy pipeline is red or the site has
// not shipped within FRESHNESS_MAX_AGE_DAYS (default 3). Catches the failure
// mode where deploy runs keep failing on push and nobody notices.
//
// Env: GITHUB_TOKEN (read access), GITHUB_REPOSITORY (set by Actions),
//      FRESHNESS_MAX_AGE_DAYS (default 3).

const repo = process.env.GITHUB_REPOSITORY ?? "Lilong-Dong-Lab/code2cure-slides";
const workflowFile = "deploy.yaml";
const maxAgeDays = Number(process.env.FRESHNESS_MAX_AGE_DAYS ?? 3);

async function gh(path) {
  const headers = { Accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const res = await fetch(`https://api.github.com${path}`, { headers });
  if (!res.ok) throw new Error(`GitHub API ${res.status} on ${path}`);
  return res.json();
}

const runs = (
  await gh(`/repos/${repo}/actions/runs?branch=main&workflow=${workflowFile}&per_page=50`)
).workflow_runs;

if (!runs.length) {
  console.error(`deploy freshness: no runs found for ${workflowFile} on main`);
  process.exit(1);
}

const newestConcluded = runs.find((run) => run.conclusion !== null);
if (newestConcluded && newestConcluded.conclusion !== "success") {
  console.error(
    `deploy freshness: newest concluded run is ${newestConcluded.conclusion} ` +
      `(${newestConcluded.html_url}) — the site is not shipping`,
  );
  process.exit(1);
}

const lastSuccess = runs.find((run) => run.conclusion === "success");
if (!lastSuccess) {
  console.error(`deploy freshness: no successful run of ${workflowFile} on main`);
  process.exit(1);
}

const ageDays = (Date.now() - Date.parse(lastSuccess.created_at)) / 86_400_000;
if (ageDays > maxAgeDays) {
  console.error(
    `deploy freshness: last successful deploy is ${ageDays.toFixed(1)} days old ` +
      `(limit ${maxAgeDays}) — ${lastSuccess.html_url}`,
  );
  process.exit(1);
}

console.log(`deploy freshness: OK — last success ${ageDays.toFixed(1)} days old`);
