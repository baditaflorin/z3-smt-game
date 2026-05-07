SHELL := /bin/bash
VERSION := $(shell node -p "require('./package.json').version")
COMMIT := $(shell git rev-parse --short HEAD 2>/dev/null || echo dev)

.PHONY: help install-hooks dev build data test test-integration smoke lint fmt pages-preview release clean hooks-pre-commit hooks-commit-msg hooks-pre-push

help:
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "%-20s %s\n", $$1, $$2}'

install-hooks: ## Wire local git hooks
	git config core.hooksPath .githooks
	chmod +x .githooks/*

dev: ## Run the frontend dev server
	npm run dev

build: ## Build the Pages-ready static site into docs/
	VITE_APP_VERSION=$(VERSION) VITE_GIT_COMMIT=$(COMMIT) npm run build
	test -f docs/index.html
	test -f docs/404.html
	grep -q '<div id="app"></div>' docs/index.html

data: ## Mode A has no generated data artifacts
	@echo "Mode A: puzzle data is bundled in src/features/puzzles/catalog.ts"

test: ## Run unit tests
	npm run test

test-integration: ## Run integration tests
	@echo "No separate integration suite in Mode A v1"

smoke: ## Build, serve docs/, and run Playwright smoke tests
	npm run smoke

lint: ## Run linters and type checks
	npm run lint
	npm run typecheck
	npm run fmt:check

fmt: ## Format source files
	npm run fmt

pages-preview: ## Serve the built Pages output locally
	npm run build
	npm run preview

release: ## Run checks and create a semver tag if TAG=vX.Y.Z is provided
	@test -n "$(TAG)" || (echo "Usage: make release TAG=v0.1.0" && exit 1)
	$(MAKE) test
	$(MAKE) build
	$(MAKE) smoke
	git tag -a "$(TAG)" -m "release: $(TAG)"

clean: ## Remove generated output and test artifacts
	node scripts/clean-pages-output.mjs
	rm -rf coverage playwright-report test-results tmp

hooks-pre-commit: ## Run the pre-commit hook manually
	.githooks/pre-commit

hooks-commit-msg: ## Run the commit-msg hook manually with MSG=.git/COMMIT_EDITMSG
	@test -n "$(MSG)" || (echo "Usage: make hooks-commit-msg MSG=.git/COMMIT_EDITMSG" && exit 1)
	.githooks/commit-msg "$(MSG)"

hooks-pre-push: ## Run the pre-push hook manually
	.githooks/pre-push
