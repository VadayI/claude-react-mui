# План: чотири CI-гейти для claude-react-mui

> Статус: **план + рекомендації** (код ще не змінювався). Внесення змін узгоджено робити **напряму, без PR**.
> Дата: 2026-06-02. Контекст: правила вже посилаються на ці гейти, але в коді їх немає.

## Поточний стан (перевірені факти)

- `.github/workflows/frontend-ci.yml` — два джоби: `quality` (typecheck → lint → 4 наявні гейт-скрипти → `test:cov` → `build`; **після build нічого не виконується**) і `e2e` (`needs: quality`, окремий checkout/install + Playwright).
- `package.json` — `build` = `tsc -b && vite build`, `preview` = `vite preview`. Залежності `@lhci/cli` **немає**. Усі версії з caret-діапазонами.
- Стиль скриптів: `#!/usr/bin/env bash`, коментар-шлях другим рядком, `set -uo pipefail` (без `-e`, FAIL керується вручну), лог-префікс `[<script>] OK|FAIL|SKIP|NOTE — …`, запуск з кореня репо, явні `exit 0/1`.
- **`jq` ніде не використовується** → нові скрипти читають JSON через `node -e` (Node 20.19+ і так обов'язковий).
- Відсутні: `.performance-budget.json`, `renovate.json`, `.github/dependabot.yml`, будь-який `lighthouserc*`.
- `Makefile` має ціль `gates:`; `node-commands.md` має блок «Quality gates» — обидва треба доповнити.

---

## Гейт 1 — `scripts/check_bundle_size.sh` (самодостатній)

**Створити:** `scripts/check_bundle_size.sh`, `.performance-budget.json` (корінь).
**Редагувати:** `frontend-ci.yml`, `Makefile`, `node-commands.md`.

`.performance-budget.json` (КБ, за performance-budgets.md):

```json
{
  "initialJsGzipKB": 180,
  "totalInitialGzipKB": 350,
  "lazyChunkGzipKB": 120
}
```

Підхід: gzip-розмір файлу = `gzip -c "$f" | wc -c` (байти), бюджети читаються через `node -e`. Початковий граф визначаємо за **Vite-маніфестом** (увімкнути `build: { manifest: true }` у `vite.config.ts`) — рекомендований варіант (A); евристика «`index-*.js` + статичні vendor-чанки = initial, решта = lazy» — запасний (B). `SKIP` (`exit 0`), якщо `dist/` відсутній; `FAIL` (`exit 1`), якщо немає файлу бюджету або перевищено ліміт.

CI: одразу після кроку `Build` у джобі `quality`:

```yaml
      - name: Gate — bundle size
        run: bash scripts/check_bundle_size.sh
```

Правило «регресія > 5%» вимагає збереженого baseline — **відкласти** в окрему ітерацію (потрібен закомічений `.performance-baseline.json` + логіка храповика). Перша версія — лише абсолютні бюджети.

---

## Гейт 2 — Lighthouse CI / `lhci` (потребує уважного wiring)

**Створити:** `lighthouserc.json` (корінь).
**Редагувати:** `package.json` (devDep `@lhci/cli@^0.14.0` + скрипт `"lhci": "lhci autorun"`, перегенерувати lockfile), `frontend-ci.yml`, `node-commands.md`.

`lighthouserc.json` (пороги за performance-budgets.md: LCP 2.5s, CLS 0.1, TBT 200ms, INP 200ms, Perf ≥90):

```json
{
  "ci": {
    "collect": {
      "startServerCommand": "npm run preview",
      "url": ["http://localhost:4173/"],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["warn", { "minScore": 0.9 }],
        "largest-contentful-paint": ["warn", { "maxNumericValue": 2500 }],
        "cumulative-layout-shift": ["warn", { "maxNumericValue": 0.1 }],
        "total-blocking-time": ["warn", { "maxNumericValue": 200 }],
        "interaction-to-next-paint": ["warn", { "maxNumericValue": 200 }]
      }
    },
    "upload": { "target": "temporary-public-storage" }
  }
}
```

Нюанси: `vite preview` слухає порт **4173** (не 5173). Правило каже «mid-tier mobile» — Lighthouse за замовчуванням мобільний, тож **не ставити desktop-preset**. INP у лабораторному Lighthouse ненадійний → лишити `warn`, лабораторний проксі — TBT. **Рекомендація: стартувати в режимі `warn`**, зібрати реальні цифри, потім переключити на `error` (інакше свіжий шаблон під мобільною емуляцією на CI-раннері може дати перманентно червоний main).

CI: окремий джоб поряд з `e2e` (`needs: quality`), що робить checkout → setup-node → `npm ci` → `npm run build` → `npm run lhci`. `ubuntu-latest` зазвичай має Chrome; якщо ні — додати крок встановлення Chromium.

---

## Гейт 3 — `npm audit` у CI (самодостатній)

**Редагувати:** лише `frontend-ci.yml` (опційно Makefile/docs). Нових файлів і залежностей не треба.

Крок у джобі `quality` після `npm ci`:

```yaml
      - name: Gate — npm audit (high/critical)
        run: npm audit --audit-level=high
```

`--audit-level=high` валить лише на high+critical (moderate/low не блокують) — точне відображення правила. Нюанс: `npm audit` ходить у реєстр (можливі мережеві флапи). Механізм винятків з терміном дії (accepted-risk) — за потреби додати пізніше через обгортку `scripts/check_audit.sh`; зараз достатньо inline-кроку.

---

## Гейт 4 — Renovate (рекомендовано) або Dependabot

**Створити:** `renovate.json` (корінь) — рекомендовано; або `.github/dependabot.yml`.

Вибір: **Renovate** — нативне групування, `automerge` + `platformAutomerge` (зливає лише на зелених required-checks), гранульовані `packageRules`. Dependabot не вміє auto-merge сам (потрібен окремий workflow) і має грубше групування. Зовнішня передумова: встановити **Renovate GitHub App** на репо (дія адміна організації, поза цим репо).

`renovate.json` (за upgrade-policy.md): dev-toolchain patch/minor — згруповано + auto-merge; runtime-бібліотеки (React / MUI / React Router / TanStack Query / Zustand) — кожна своя група patch/minor + auto-merge; major — `automerge: false` + лейбли `major`/`needs-human`; security (`vulnerabilityAlerts`) — пришвидшено, будь-коли; `lockFileMaintenance` увімкнено; `:dependencyDashboard` для видимості.

```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": ["config:recommended", ":dependencyDashboard"],
  "schedule": ["before 6am on monday"],
  "labels": ["dependencies"],
  "platformAutomerge": true,
  "lockFileMaintenance": { "enabled": true, "schedule": ["before 6am on monday"] },
  "packageRules": [
    { "matchDepTypes": ["devDependencies"], "matchUpdateTypes": ["patch", "minor"], "groupName": "dev toolchain (patch/minor)", "automerge": true },
    { "matchPackageNames": ["react", "react-dom", "@types/react", "@types/react-dom"], "groupName": "React", "matchUpdateTypes": ["patch", "minor"], "automerge": true },
    { "matchPackageNames": ["@mui/material", "@mui/icons-material", "@emotion/react", "@emotion/styled"], "groupName": "MUI", "matchUpdateTypes": ["patch", "minor"], "automerge": true },
    { "matchPackageNames": ["react-router-dom"], "groupName": "React Router", "matchUpdateTypes": ["patch", "minor"], "automerge": true },
    { "matchPackageNames": ["@tanstack/react-query"], "groupName": "TanStack Query", "matchUpdateTypes": ["patch", "minor"], "automerge": true },
    { "matchPackageNames": ["zustand"], "groupName": "Zustand", "matchUpdateTypes": ["patch", "minor"], "automerge": true },
    { "matchUpdateTypes": ["major"], "automerge": false, "addLabels": ["major", "needs-human"] }
  ],
  "vulnerabilityAlerts": { "labels": ["security"], "automerge": true, "schedule": ["at any time"] }
}
```

Критична передумова ефективності: auto-merge спрацює лише якщо джоби `quality`/`e2e`/`lighthouse` призначені **required status checks** у branch protection на `main` (дія адміна репо).

---

## Рекомендований порядок впровадження

1. **Гейт 3 — `npm audit`** — найменший (один рядок CI, без файлів/залежностей), найнижчий ризик.
2. **Гейт 1 — `check_bundle_size.sh` + `.performance-budget.json`** — самодостатній, у стилі наявних скриптів. Заздалегідь вирішити manifest vs евристика (можливо, чіпнути `vite.config.ts`).
3. **Гейт 4 — `renovate.json`** — сам файл безпечно лягає першим; реальний ефект потребує Renovate App + required-checks (кроки адміна).
4. **Гейт 2 — Lighthouse CI** — найбільше рухомих частин (новий devDep + lockfile, новий джоб, Chrome на раннері, порт 4173, рішення mobile-vs-desktop і warn-vs-error). Робити останнім, стартувати в `warn`.

**Самодостатні:** Гейт 1, Гейт 3, файл конфіга Гейта 4.
**Потребують уважного wiring / зовнішніх передумов:** Гейт 2; ефективність Гейта 4 (Renovate App + branch protection).

## Наскрізні ризики / відкриті питання

- **Lockfile**: `@lhci/cli` вимагає перегенерувати й закомітити `package-lock.json` (CI робить `npm ci`). Renovate runtime-залежностей не додає.
- **Порт preview** = 4173 — url у lighthouserc має збігатися.
- **`vite.config.ts`** без `build.manifest` — потрібен для точного варіанта (A) виміру бандла.
- **Ідентифікація initial-чанка** (manifest vs евристика) — єдине справді неоднозначне місце; рекомендація — manifest.
- **Warn vs gate** для Lighthouse і **храповик 5%** — Lighthouse стартувати в `warn`, храповик відкласти (потрібен baseline).
- **Без `jq`** — bundle-скрипт читає JSON через `node -e`.
- **Auto-merge Renovate** залежить від required-checks у branch protection — поза файлами цього репо.
