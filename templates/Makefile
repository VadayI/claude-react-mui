# Makefile — convenience wrappers around npm scripts and gate scripts.
# Usage: make <target> [ARGS="..."]
#
# These targets mirror the canonical npm scripts exactly — they are shortcuts,
# not the source of truth. The canonical commands are in package.json.
# `make` is never required by the CI pipeline (GitHub Actions calls npm directly).

.PHONY: help setup install dev build test cov e2e lint fmt typecheck types gates doctor-deps

# Self-documenting help — lists all targets with their inline ## comment.
help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
	  awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}' | sort

setup: ## Bootstrap WSL2 environment (node + npm + claude CLI). Runs scripts/setup-wsl.sh.
	bash scripts/setup-wsl.sh

install: ## Install npm dependencies (npm ci).
	npm ci

dev: ## Start the Vite dev server (http://localhost:5173).
	npm run dev

build: ## Production build (output: dist/).
	npm run build

test: ## Run Vitest in watch mode. Pass ARGS="-t <pattern>" to filter.
	npm run test -- $(ARGS)

cov: ## Run Vitest once with coverage report.
	npm run test:cov

e2e: ## Run Playwright E2E tests (needs dev or preview server). Pass ARGS="<spec>" to filter.
	npm run e2e -- $(ARGS)

lint: ## ESLint check.
	npm run lint

fmt: ## Prettier format (writes files).
	npm run format

typecheck: ## TypeScript type-check (tsc --noEmit).
	npm run typecheck

types: ## Regenerate src/lib/api/schema.d.ts from committed openapi.yml.
	npm run api:types

gates: ## Run all CI gate scripts locally before pushing.
	bash scripts/check_types_drift.sh
	bash scripts/check_stubs.sh
	bash scripts/check_file_size.sh
	bash scripts/check_feature_readmes.sh
	npm audit --audit-level=high
	npm run build
	bash scripts/check_bundle_size.sh

doctor-deps: ## Quick check that required host tools are present (node, npm, claude, gh).
	@echo "--- host tool presence check ---"
	@node --version   2>/dev/null && echo "  node   OK" || echo "  node   MISSING"
	@npm  --version   2>/dev/null && echo "  npm    OK" || echo "  npm    MISSING"
	@claude --version 2>/dev/null && echo "  claude OK" || echo "  claude MISSING"
	@gh --version     2>/dev/null && echo "  gh     OK" || echo "  gh     MISSING"
