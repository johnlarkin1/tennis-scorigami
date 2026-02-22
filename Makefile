.PHONY: dev build start lint fix format typecheck test test-watch test-coverage test-e2e storybook sync-public sync-public-dry-run db-generate db-push db-migrate db-studio db-seed

# ============================================================================
# Development
# ============================================================================

dev:
	npm run dev

build:
	npm run build

start:
	npm start

# ============================================================================
# Code Quality
# ============================================================================

lint:
	npm run lint

fix:
	npm run lint:fix

format:
	npm run format

typecheck:
	npm run typecheck

# ============================================================================
# Database
# ============================================================================

db-generate:
	npm run db:generate

db-push:
	npm run db:push

db-migrate:
	npm run db:migrate

db-studio:
	npm run db:studio

db-seed:
	npm run db:seed

# ============================================================================
# Testing
# ============================================================================

test:
	npm test

test-watch:
	npm run test:watch

test-coverage:
	npm run test:coverage

test-e2e:
	npm run test:e2e

# ============================================================================
# Tools
# ============================================================================

storybook:
	npm run storybook

# ============================================================================
# Public Repo Sync
# ============================================================================

# Paths to exclude from the public repo (IP / database internals)
EXCLUDED_PATHS := \
	--path backend/ \
	--path src/db/ \
	--path drizzle.config.ts \
	--path ca.pem \
	--path run_mv_update.sql \
	--path update_materialized_view.md \
	--path TESTING.md \
	--path playwright-report/

INTERNAL_REMOTE := git@github.com:johnlarkin1/tennis-scorigami-internal.git
PUBLIC_REMOTE := git@github.com:johnlarkin1/tennis-scorigami.git
TEMP_DIR := /tmp/tennis-scorigami-sync

# Preview what would be removed (no actual push)
sync-public-dry-run:
	@echo "==> Cloning internal repo to temp directory..."
	rm -rf $(TEMP_DIR)
	git clone $(INTERNAL_REMOTE) $(TEMP_DIR)
	@echo "==> Running filter-repo (dry-run)..."
	cd $(TEMP_DIR) && git filter-repo $(EXCLUDED_PATHS) --invert-paths --dry-run
	@echo "==> Dry run complete. Temp dir at $(TEMP_DIR)"

# Clone internal, strip excluded paths from all history, force push to public
sync-public:
	@echo "==> Cloning internal repo to temp directory..."
	rm -rf $(TEMP_DIR)
	git clone $(INTERNAL_REMOTE) $(TEMP_DIR)
	@echo "==> Stripping excluded paths from history..."
	cd $(TEMP_DIR) && git filter-repo $(EXCLUDED_PATHS) --invert-paths
	@echo "==> Adding database stubs..."
	mkdir -p $(TEMP_DIR)/src/db/schema
	cp scripts/public-stubs/db/index.ts $(TEMP_DIR)/src/db/index.ts
	cp scripts/public-stubs/db/schema/index.ts $(TEMP_DIR)/src/db/schema/index.ts
	rm -rf $(TEMP_DIR)/scripts/public-stubs
	cd $(TEMP_DIR) && git add src/db/ && git rm -rf scripts/public-stubs 2>/dev/null || true
	@echo "==> Adding backend/ placeholder..."
	mkdir -p $(TEMP_DIR)/backend
	touch $(TEMP_DIR)/backend/.gitkeep
	@printf '# Backend\n\nThe data ingestion pipeline for Tennis Scorigami is not included in this public repository.\n\nIt handles ETL processing of tennis match data from multiple sources (Sackmann datasets, SportRadar API) into our PostgreSQL database. This code is kept private to protect the intellectual property behind the project.\n\nIf you have questions about the data pipeline or are interested in collaborating, feel free to open an issue.\n' > $(TEMP_DIR)/backend/README.md
	cd $(TEMP_DIR) && git add backend/ && git commit -m "Add database stubs and backend/ placeholder for public repo"
	@echo "==> Pushing to public remote..."
	cd $(TEMP_DIR) && git remote add public $(PUBLIC_REMOTE) && git push public main --force
	@echo "==> Cleaning up..."
	rm -rf $(TEMP_DIR)
	@echo "==> Done! Public repo synced."
