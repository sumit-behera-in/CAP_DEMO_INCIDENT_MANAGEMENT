# ==========================================
# SAP CAP + Git Automation Makefile
# ==========================================

APP_NAME=cap-incident-manager
PORT=4004
BRANCH := $(shell git rev-parse --abbrev-ref HEAD)

# ==========================================
# HELP
# ==========================================

.PHONY: help
help:
	@echo "🔥 Available commands:"
	@echo " make dev              - Full dev setup (install + deploy + run)"
	@echo " make watch            - Start CAP in watch mode"
	@echo " make test             - Run tests"
	@echo " make lint             - Run linter"
	@echo " make format           - Format code"
	@echo " make reset-db         - Reset DB"
	@echo " make clean            - Clean project"
	@echo " make push MSG='msg'   - Test + commit + push"
	@echo " make push-safe MSG='' - Pull + push safely"
	@echo " make debug            - Run with debug logs"

# ==========================================
# SETUP
# ==========================================

.PHONY: install
install:
	npm install

# ==========================================
# RUN CAP APP
# ==========================================

.PHONY: watch
watch:
	cds watch

.PHONY: start
start:
	cds run

.PHONY: debug
debug:
	DEBUG=cds:* cds watch

# ==========================================
# DATABASE
# ==========================================

.PHONY: deploy
deploy:
	cds deploy

.PHONY: deploy-memory
deploy-memory:
	cds deploy --to sqlite::memory:

.PHONY: reset-db
reset-db:
	rm -f sqlite.db
	cds deploy

# ==========================================
# TESTING
# ==========================================

.PHONY: test
test:
	npm test

.PHONY: test-watch
test-watch:
	npm test -- --watch

.PHONY: test-coverage
test-coverage:
	npm test -- --coverage

# ==========================================
# CODE QUALITY
# ==========================================

.PHONY: lint
lint:
	npx eslint . || true

.PHONY: format
format:
	npx prettier --write .

# ==========================================
# BUILD
# ==========================================

.PHONY: build
build:
	npx cds build

# ==========================================
# CLEANUP
# ==========================================

.PHONY: clean
clean:
	rm -rf node_modules
	rm -f package-lock.json
	rm -rf gen
	rm -f sqlite.db

.PHONY: deep-clean
deep-clean: clean
	npm cache clean --force

# ==========================================
# PROCESS MANAGEMENT
# ==========================================

.PHONY: kill
kill:
	@echo "Killing app on port $(PORT)..."
	@lsof -ti:$(PORT) | xargs kill -9 || true

# ==========================================
# DEV SHORTCUTS
# ==========================================

.PHONY: dev
dev: install deploy watch

.PHONY: fresh
fresh: clean install deploy watch

.PHONY: rebuild
rebuild: clean install build

# ==========================================
# GIT COMMANDS
# ==========================================

.PHONY: git-status
git-status:
	git status

.PHONY: branch
branch:
	@echo "Current branch: $(BRANCH)"

# ==========================================
# 🚀 MAIN AUTOMATION (TEST + PUSH)
# ==========================================

.PHONY: push
push:
ifndef MSG
	$(error ❌ Provide commit message: make push MSG="your message")
endif
	@echo "🔍 Running lint..."
	@$(MAKE) lint

	@echo "🧪 Running tests..."
	@$(MAKE) test

	@echo "📦 Adding changes..."
	git add .

	@echo "📝 Committing..."
	git commit -m "$(MSG)"

	@echo "🚀 Pushing to $(BRANCH)..."
	git push origin $(BRANCH)

	@echo "✅ Successfully pushed!"

# ==========================================
# SAFE PUSH (WITH PULL)
# ==========================================

.PHONY: push-safe
push-safe:
ifndef MSG
	$(error ❌ Provide commit message: make push-safe MSG="your message")
endif
	@echo "⬇️ Pulling latest changes..."
	git pull origin $(BRANCH)

	@$(MAKE) push MSG="$(MSG)"

# ==========================================
# COMMIT SHORTCUTS
# ==========================================

.PHONY: push-feat
push-feat:
	$(MAKE) push MSG="feat: $(MSG)"

.PHONY: push-fix
push-fix:
	$(MAKE) push MSG="fix: $(MSG)"

.PHONY: push-refactor
push-refactor:
	$(MAKE) push MSG="refactor: $(MSG)"

# ==========================================
# CI/CD HELPERS
# ==========================================

.PHONY: ci
ci: install lint test

.PHONY: ci-full
ci-full: install lint test build