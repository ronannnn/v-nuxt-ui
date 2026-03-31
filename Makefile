.PHONY: install dev dev-build dev-prepare build lint lint-fix typecheck \
        publish publish-dry publish-patch publish-minor publish-major \
        version-patch version-minor version-major \
        clean help

# Current version from package.json
VERSION := $(shell node -p "require('./package.json').version")
PACKAGE_NAME := $(shell node -p "require('./package.json').name")

# Default target
help:
	@echo "$(PACKAGE_NAME) v$(VERSION)"
	@echo ""
	@echo "Development:"
	@echo "  make install         Install dependencies"
	@echo "  make dev             Start playground dev server"
	@echo "  make dev-build       Build playground"
	@echo "  make dev-prepare     Prepare module (stub build + playground)"
	@echo ""
	@echo "Build & Quality:"
	@echo "  make build           Build the module for production"
	@echo "  make lint            Run linter"
	@echo "  make lint-fix        Run linter with auto-fix"
	@echo "  make typecheck       Run type checking"
	@echo ""
	@echo "Publishing:"
	@echo "  make publish-dry     Dry-run pack (preview what will be published)"
	@echo "  make publish         Build and publish current version to npm"
	@echo "  make publish-patch   Bump patch version, build and publish  (x.x.X)"
	@echo "  make publish-minor   Bump minor version, build and publish  (x.X.0)"
	@echo "  make publish-major   Bump major version, build and publish  (X.0.0)"
	@echo ""
	@echo "Maintenance:"
	@echo "  make clean           Remove dist, node_modules and nuxt caches"

# ─── Install ──────────────────────────────────────────────────────────────────

install:
	pnpm install

# ─── Development ──────────────────────────────────────────────────────────────

dev: dev-prepare
	pnpm dev

dev-build:
	pnpm dev:build

dev-prepare:
	pnpm dev:prepare

# ─── Build & Quality ──────────────────────────────────────────────────────────

build:
	pnpm build

lint:
	pnpm lint

lint-fix:
	pnpm lint:fix

typecheck:
	pnpm typecheck

# ─── Version bumping (no publish) ─────────────────────────────────────────────

version-patch:
	npm version patch --no-git-tag-version
	@echo "Bumped to $$(node -p "require('./package.json').version")"

version-minor:
	npm version minor --no-git-tag-version
	@echo "Bumped to $$(node -p "require('./package.json').version")"

version-major:
	npm version major --no-git-tag-version
	@echo "Bumped to $$(node -p "require('./package.json').version")"

# ─── Publishing ───────────────────────────────────────────────────────────────

# Preview what files will be included in the published package
publish-dry: build
	@echo ""
	npm pack --dry-run
	@echo ""
	@echo "Run 'make publish' to publish v$(VERSION)"

# Publish the current version as-is
publish: _check-npm-auth build
	@NEW_VERSION=$$(node -p "require('./package.json').version"); \
	echo "Publishing $(PACKAGE_NAME)@$$NEW_VERSION ..."; \
	npm publish; \
	echo ""; \
	echo "Published $(PACKAGE_NAME)@$$NEW_VERSION"; \
	git add package.json; \
	git commit -m "chore(release): 发布 v$$NEW_VERSION" --no-verify; \
	git tag "v$$NEW_VERSION"; \
	echo "Tagged v$$NEW_VERSION — run 'git push && git push --tags' to push"

# Bump patch (x.x.X), then build and publish
publish-patch: _check-npm-auth version-patch build
	@NEW_VERSION=$$(node -p "require('./package.json').version"); \
	echo "Publishing $(PACKAGE_NAME)@$$NEW_VERSION ..."; \
	npm publish; \
	echo ""; \
	echo "Published $(PACKAGE_NAME)@$$NEW_VERSION"; \
	git add package.json; \
	git commit -m "chore(release): 发布 v$$NEW_VERSION" --no-verify; \
	git tag "v$$NEW_VERSION"; \
	echo "Tagged v$$NEW_VERSION — run 'git push && git push --tags' to push"

# Bump minor (x.X.0), then build and publish
publish-minor: _check-npm-auth version-minor build
	@NEW_VERSION=$$(node -p "require('./package.json').version"); \
	echo "Publishing $(PACKAGE_NAME)@$$NEW_VERSION ..."; \
	npm publish; \
	echo ""; \
	echo "Published $(PACKAGE_NAME)@$$NEW_VERSION"; \
	git add package.json; \
	git commit -m "chore(release): 发布 v$$NEW_VERSION" --no-verify; \
	git tag "v$$NEW_VERSION"; \
	echo "Tagged v$$NEW_VERSION — run 'git push && git push --tags' to push"

# Bump major (X.0.0), then build and publish
publish-major: _check-npm-auth version-major build
	@NEW_VERSION=$$(node -p "require('./package.json').version"); \
	echo "Publishing $(PACKAGE_NAME)@$$NEW_VERSION ..."; \
	npm publish; \
	echo ""; \
	echo "Published $(PACKAGE_NAME)@$$NEW_VERSION"; \
	git add package.json; \
	git commit -m "chore(release): 发布 v$$NEW_VERSION" --no-verify; \
	git tag "v$$NEW_VERSION"; \
	echo "Tagged v$$NEW_VERSION — run 'git push && git push --tags' to push"

# ─── Internal helpers ─────────────────────────────────────────────────────────

# Verify the user is logged in to npm before attempting to publish
_check-npm-auth:
	@npm whoami > /dev/null 2>&1 || \
		(echo "Not logged in to npm. Run 'npm login' first." && exit 1)

# ─── Maintenance ──────────────────────────────────────────────────────────────

clean:
	rm -rf dist node_modules .nuxt playground/.nuxt playground/.output
