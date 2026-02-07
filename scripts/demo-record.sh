#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUTPUT_DIR=${DEMO_OUTPUT_DIR:-"${ROOT_DIR}/demo-output"}

export ECHOVAULT_API=${ECHOVAULT_API:-http://localhost:8787}
export ECHOVAULT_SECRET=${ECHOVAULT_SECRET:-dev-secret}
export ECHOVAULT_OWNER=${ECHOVAULT_OWNER:-OWNER}
export ECHOVAULT_GRANTEE=${ECHOVAULT_GRANTEE:-GRANTEE}
export ECHOVAULT_SCOPE_HASH=${ECHOVAULT_SCOPE_HASH:-SCOPE_HASH}
export ECHOVAULT_STORAGE_DIR=${ECHOVAULT_STORAGE_DIR:-${ROOT_DIR}/echovault-storage}

mkdir -p "${OUTPUT_DIR}" "${ECHOVAULT_STORAGE_DIR}"

API_LOG="${OUTPUT_DIR}/api.log"
DEMO_LOG="${OUTPUT_DIR}/demo.log"

cleanup() {
  if [[ "${KEEP_API:-}" == "true" ]]; then
    return
  fi
  if [[ -n "${API_PID:-}" ]] && kill -0 "$API_PID" 2>/dev/null; then
    kill "$API_PID"
  fi
}
trap cleanup EXIT

printf "Starting API...\n"
printf "Logs: %s (override with DEMO_OUTPUT_DIR). KEEP_API=%s\n" "$OUTPUT_DIR" "${KEEP_API:-false}"
node "${ROOT_DIR}/packages/api/src/index.js" >"${API_LOG}" 2>&1 &
API_PID=$!

printf "Waiting for API on %s...\n" "$ECHOVAULT_API"
for i in {1..20}; do
  if curl -s "${ECHOVAULT_API}/status" >/dev/null 2>&1; then
    break
  fi
  sleep 0.5
  if [[ "$i" -eq 20 ]]; then
    echo "API did not become ready. Check ${API_LOG}." >&2
    exit 1
  fi
done

printf "Running encrypted demo...\n"
node "${ROOT_DIR}/scripts/e2e-encrypt-demo.js" | tee "${DEMO_LOG}"

printf "\nDemo logs saved:\n- %s\n- %s\n" "$API_LOG" "$DEMO_LOG"
