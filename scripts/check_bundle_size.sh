#!/usr/bin/env bash
# scripts/check_bundle_size.sh
#
# Gate: the production bundle (dist/) must stay within the gzipped budgets
# declared in .performance-budget.json (the "bundle" section).
#
#   - initial JS    : sum of gzipped JS the browser loads on first paint —
#                     every <script type=module> + <link rel=modulepreload>
#                     referenced by dist/index.html.
#   - initial xfer  : initial JS + the gzipped CSS referenced by index.html.
#   - lazy chunk    : every OTHER dist/assets/*.js chunk (route-split / dynamic
#                     imports), each checked individually.
#
# Run AFTER `npm run build`. CI runs the Build step first; locally:
#   npm run build && bash scripts/check_bundle_size.sh
#
# The Core Web Vitals / Lighthouse budgets in the same JSON file are enforced
# by Lighthouse CI (not yet wired) — see .claude/rules/performance-budgets.md.
#
# Override the budget file via environment:
#   BUDGET_FILE=custom.json bash scripts/check_bundle_size.sh
#
# Exits 1 on any breach, 0 if every chunk is within budget.

set -uo pipefail

DIST_DIR="${DIST_DIR:-dist}"
BUDGET_FILE="${BUDGET_FILE:-.performance-budget.json}"
INDEX="$DIST_DIR/index.html"
FAIL=0

if [[ ! -f "$BUDGET_FILE" ]]; then
  echo "[check_bundle_size] SKIP — $BUDGET_FILE not found."
  exit 0
fi

if [[ ! -d "$DIST_DIR" ]]; then
  echo "[check_bundle_size] SKIP — $DIST_DIR/ not found. Run 'npm run build' first."
  exit 0
fi

if ! command -v node >/dev/null 2>&1; then
  echo "[check_bundle_size] FAIL — node is required to read $BUDGET_FILE."
  exit 1
fi

if [[ ! -f "$INDEX" ]]; then
  echo "[check_bundle_size] FAIL — $INDEX not found in build output."
  exit 1
fi

# Read the three gzipped budgets (KB) from the JSON in one node call.
read -r INITIAL_JS_KB TOTAL_KB LAZY_KB < <(node -e '
  const b = (JSON.parse(require("fs").readFileSync(process.argv[1], "utf8")).bundle) || {};
  const n = (v) => (typeof v === "number" ? v : 0);
  process.stdout.write([n(b.initialJsGzipKb), n(b.totalInitialTransferGzipKb), n(b.lazyChunkGzipKb)].join(" "));
' "$BUDGET_FILE")

# Gzipped size of a file, in KB (one decimal).
gz_kb() { gzip -c "$1" | wc -c | awk '{printf "%.1f", $1/1024}'; }

# Asset paths referenced by index.html (entry script + modulepreload + css).
# Normalize: strip query/hash and any leading "/" or base prefix, keep basename.
mapfile -t REF_BASENAMES < <(
  grep -oE '(src|href)="[^"]+\.(js|css)"' "$INDEX" \
    | sed -E 's/.*="([^"]+)".*/\1/' \
    | sed -E 's/[?#].*$//' \
    | xargs -r -n1 basename \
    | sort -u
)

is_referenced() {
  local base; base="$(basename "$1")"
  local r
  for r in "${REF_BASENAMES[@]}"; do
    [[ "$r" == "$base" ]] && return 0
  done
  return 1
}

initial_js=0
initial_css=0
declare -a LAZY_JS=()

# Walk every emitted JS/CSS asset.
while IFS= read -r -d '' f; do
  kb="$(gz_kb "$f")"
  case "$f" in
    *.js)
      if is_referenced "$f"; then
        initial_js="$(awk -v a="$initial_js" -v b="$kb" 'BEGIN{printf "%.1f", a+b}')"
      else
        LAZY_JS+=("$f|$kb")
      fi
      ;;
    *.css)
      if is_referenced "$f"; then
        initial_css="$(awk -v a="$initial_css" -v b="$kb" 'BEGIN{printf "%.1f", a+b}')"
      fi
      ;;
  esac
done < <(find "$DIST_DIR" -type f \( -name '*.js' -o -name '*.css' \) -print0)

total_initial="$(awk -v a="$initial_js" -v b="$initial_css" 'BEGIN{printf "%.1f", a+b}')"

over() { awk -v v="$1" -v lim="$2" 'BEGIN{exit !(v > lim)}'; }

echo "[check_bundle_size] gzipped budgets — initial JS ${INITIAL_JS_KB}KB · initial transfer ${TOTAL_KB}KB · lazy chunk ${LAZY_KB}KB"
echo "[check_bundle_size] measured — initial JS ${initial_js}KB · initial transfer ${total_initial}KB (JS ${initial_js} + CSS ${initial_css}) · ${#LAZY_JS[@]} lazy chunk(s)"

if over "$initial_js" "$INITIAL_JS_KB"; then
  echo "  OVER: initial JS ${initial_js}KB > ${INITIAL_JS_KB}KB"
  FAIL=1
fi
if over "$total_initial" "$TOTAL_KB"; then
  echo "  OVER: initial transfer ${total_initial}KB > ${TOTAL_KB}KB"
  FAIL=1
fi
for entry in "${LAZY_JS[@]}"; do
  f="${entry%|*}"; kb="${entry#*|}"
  if over "$kb" "$LAZY_KB"; then
    echo "  OVER: lazy chunk $(basename "$f") ${kb}KB > ${LAZY_KB}KB"
    FAIL=1
  fi
done

if (( FAIL == 1 )); then
  echo ""
  echo "[check_bundle_size] FAIL — bundle exceeds the budget in $BUDGET_FILE."
  echo "  Code-split heavy/rare modules (React.lazy + dynamic import), import named"
  echo "  members only, and check dependency weight before adding it."
  exit 1
fi

echo "[check_bundle_size] OK — bundle is within budget."
exit 0
