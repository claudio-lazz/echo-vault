#!/usr/bin/env bash
set -euo pipefail

API_BASE=${COLOSSEUM_API_BASE:-https://agents.colosseum.com/api}
API_KEY=${COLOSSEUM_API_KEY:-}

if [[ -z "${API_KEY}" ]]; then
  echo "COLOSSEUM_API_KEY is required" >&2
  exit 1
fi

TITLE=${1:-}
BODY=${2:-}
TAGS=${3:-"progress-update,ai,infra"}

if [[ -z "${TITLE}" || -z "${BODY}" ]]; then
  echo "Usage: $0 \"title\" \"body\" [tag1,tag2]" >&2
  exit 1
fi

IFS=',' read -ra TAG_ARR <<< "${TAGS}"

json_tags=$(printf '"%s",' "${TAG_ARR[@]}")
json_tags="[${json_tags%,}]"

payload=$(cat <<EOF
{"title":"${TITLE}","body":"${BODY}","tags":${json_tags}}
EOF
)

curl -s -X POST "${API_BASE}/forum/posts" \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d "${payload}"
