.PHONY: install dev dev-build dev-prepare build lint lint-fix typecheck publish publish-dry clean help

# Default target
help:
	@echo "V Nuxt UI - Makefile Commands"
	@echo ""
	@echo "  Development:"
	@echo "    make install        - Install dependencies"
	@echo "    make dev            - Start playground dev server"
	@echo "    make dev-build      - Build playground"
	@echo "    make dev-prepare    - Prepare module (stub build + playground)"
	@echo ""
	@echo "  Build & Quality:"
	@echo "    make build          - Build the module for production"
	@echo "    make lint           - Run linter"
	@echo "    make lint-fix       - Run linter with auto-fix"
	@echo "    make typecheck      - Run type checking"
	@echo ""
	@echo "  Publishing:"
	@echo "    make publish-dry    - Dry-run npm publish"
	@echo "    make publish        - Publish to npm"
	@echo ""
	@echo "  Maintenance:"
	@echo "    make clean          - Remove dist and node_modules"

# Install dependencies
install:
	pnpm install

# Development
dev: dev-prepare
	pnpm dev

dev-build:
	pnpm dev:build

dev-prepare:
	pnpm dev:prepare

# Build
build:
	pnpm build

# Lint
lint:
	pnpm lint

lint-fix:
	pnpm lint:fix

# Type check
typecheck:
	pnpm typecheck

# Publish
publish-dry: build
	npm pack --dry-run

publish: build
	npm publish --access public

# Clean
clean:
	rm -rf dist node_modules .nuxt playground/.nuxt playground/.output
