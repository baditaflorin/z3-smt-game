#!/usr/bin/env bash
set -euo pipefail

if [[ -n "${PORT:-}" ]]; then
  port="${PORT}"
else
  port="$(node -e 'const net=require("node:net"); const server=net.createServer(); server.listen(0, "127.0.0.1", () => { console.log(server.address().port); server.close(); });')"
fi
base_url="http://127.0.0.1:${port}/z3-smt-game/"
mkdir -p tmp

npm run build

npm run preview -- --port "${port}" --strictPort >tmp/smoke-preview.log 2>&1 &
server_pid="$!"

cleanup() {
  kill "${server_pid}" >/dev/null 2>&1 || true
  wait "${server_pid}" >/dev/null 2>&1 || true
}
trap cleanup EXIT

for _ in {1..60}; do
  if curl -fsS "${base_url}" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

curl -fsS "${base_url}" >/dev/null
BASE_URL="${base_url}" npx playwright test tests/e2e/smoke.spec.ts --project=chromium
