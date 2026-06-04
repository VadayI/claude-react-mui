.PHONY: help install dev build test cov e2e lint fmt typecheck types gates

help: ## Show available targets
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies
	npm install

dev: ## Start dev server
	npm run dev

build: ## Type-check and build
	npm run build

test: ## Run tests in watch mode
	npm run test

cov: ## Run tests with coverage
	npm run test:cov

e2e: ## Run Playwright E2E tests
	npm run e2e

lint: ## Lint source files
	npm run lint

fmt: ## Format source files with Prettier
	npm run format

typecheck: ## Run TypeScript type checker
	npm run typecheck

types: ## Regenerate API TypeScript types from OpenAPI schema
	npm run api:types

gates: ## Run all CI gate scripts locally
	bash scripts/check_file_size.sh
	bash scripts/check_stubs.sh
	bash scripts/check_feature_readmes.sh
	bash scripts/check_types_drift.sh
	npm audit --audit-level=high
	npm run build
	bash scripts/check_bundle_size.sh
