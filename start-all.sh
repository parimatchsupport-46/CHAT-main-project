#!/usr/bin/env bash
# Eden Chat — ek command se poora system
#   npm run dev            → backend (4317) + user app (5173) + admin app (5174)
#   npm run dev -- --force → pehle purane process band karke start
set -uo pipefail
cd "$(dirname "$0")"

PORTS=(4317 5173 5174)
FORCE=0
case "${1:-}" in --force|-f) FORCE=1 ;; esac

# ---------------------------------------------------------------- helpers ----
port_pid() {                       # listening PID for a TCP port (blank if free)
  command -v ss >/dev/null 2>&1 || return 0
  ss -ltnp 2>/dev/null \
    | awk -v p=":$1" '$4 ~ p"$" {print $NF}' \
    | sed -nE 's/.*pid=([0-9]+).*/\1/p' | head -n1
}

free_port() {                      # kill whatever holds the port (graceful → hard)
  local port="$1" pid
  pid="$(port_pid "$port")"
  [[ -z "$pid" ]] && return 0
  kill "$pid" 2>/dev/null || true
  for _ in 1 2 3 4 5 6 7 8 9 10; do
    sleep 0.2
    [[ -z "$(port_pid "$port")" ]] && return 0
  done
  kill -9 "$pid" 2>/dev/null || true
  sleep 0.2
}

wait_http() {                      # $1 url, $2 label, $3 tries
  local url="$1" label="$2" tries="${3:-40}"
  for ((i = 0; i < tries; i++)); do
    curl -fs -m 1 "$url" >/dev/null 2>&1 && { printf '  ✓ %s ready\n' "$label"; return 0; }
    sleep 0.5
  done
  printf '  ✗ %s ne %s par jawab nahi diya\n' "$label" "$url"
  return 1
}

PIDS=()
cleanup() {
  trap - EXIT INT TERM
  printf '\n→ band kar rahe hain...\n'
  for pid in "${PIDS[@]:-}"; do
    [[ -n "${pid:-}" ]] && kill "$pid" 2>/dev/null || true
  done
  wait 2>/dev/null || true
  # shutdown ke baad bhi koi port atka ho to usse bhi hatao
  for port in "${PORTS[@]}"; do free_port "$port"; done
  printf '→ sab band ✓\n'
}
trap cleanup EXIT INT TERM

# ------------------------------------------------------- pre-flight check ----
busy=()
for port in "${PORTS[@]}"; do
  pid="$(port_pid "$port")"
  [[ -n "$pid" ]] && busy+=("$port:$pid")
done

if ((${#busy[@]})); then
  if ((FORCE)); then
    echo "→ purane processes band kar rahe hain: ${busy[*]}"
    for item in "${busy[@]}"; do free_port "${item%%:*}"; done
  else
    echo "✗ Ye ports already busy hain: ${busy[*]}"
    echo "  (port:pid) — shayad pichhla 'npm run dev' chal raha hai."
    echo
    echo "  Fix A:  npm run dev -- --force     # purane band karke start"
    echo "  Fix B:  kill ${busy[0]#*:}         # sirf us process ko maaro"
    exit 1
  fi
fi

# ---------------------------------------------------------------- startup ----
echo "→ local backend   http://localhost:4317"
node dev-server/server.mjs &
PIDS+=($!)

echo "→ chat-page       http://localhost:5173   (user app)"
npm --prefix chat-page run dev &
PIDS+=($!)

echo "→ chat-manage     http://localhost:5174   (admin app)"
npm --prefix chat-manage-pannel run dev &
PIDS+=($!)

ok=1
wait_http "http://127.0.0.1:4317/api/health" "backend" 40 || ok=0
wait_http "http://127.0.0.1:5173/" "chat-page" 60 || ok=0
wait_http "http://127.0.0.1:5174/" "chat-manage-pannel" 60 || ok=0

if ((ok == 0)); then
  echo "✗ Kuch start nahi hua — upar ka log dekho. Purane process ho sakte hain:"
  echo "  npm run dev -- --force"
  exit 1
fi

echo
echo "✓ Sab chal raha hai:"
echo "    user  → http://localhost:5173"
echo "    admin → http://localhost:5174"
echo "    api   → http://localhost:4317/api/health"
echo "  Band karne ke liye Ctrl+C"
echo

# koi bhi child mare to poora set band karo (aadha-adhoor system na chale)
wait -n
cleanup
exit 1
