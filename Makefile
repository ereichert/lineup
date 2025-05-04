DOCKER_ENV_VAR_FILE = .env.development
DOCKER_COMPOSE_FILE = docker-compose.yml
DOCKER_COMPOSE_CMD = podman-compose
API_SERVER_PROC_NAME = flask
API_SERVER_START = uv run $(API_SERVER_PROC_NAME) run
FLASK_API_DIRECTORY = lineup-flask-api

.PHONY: run-tests
run-tests: check-venv install-deps start-dev-stack
	@echo "Running tests..."
	uv run pytest
	$(MAKE) stop-dev-stack
	@echo "Tests completed."

.PHONY: stop-dev-env
stop-dev-env:
	@echo "Stopping development environment..."
	pkill -f $(API_SERVER_PROC_NAME)
	$(MAKE) stop-dev-stack
	@echo "Development environment stopped."

.PHONY: start-dev-env
start-dev-env: start-dev-stack
	@echo "Starting development environment..."
	$(API_SERVER_START)
	@echo "Development environment started."

.PHONY: start-dev-stack
start-dev-stack:
	@echo "Starting development stack..."
	$(DOCKER_COMPOSE_CMD) --env-file $(DOCKER_ENV_VAR_FILE) -f $(DOCKER_COMPOSE_FILE) up -d

.PHONY: stop-dev-stack
stop-dev-stack:
	@echo "Stopping development stack..."
	$(DOCKER_COMPOSE_CMD) -f $(DOCKER_COMPOSE_FILE) down

.PHONY: format
format: check-venv
	@echo "Formatting..."
	uv run black .

.PHONY: lint
lint: check-venv
	@echo "Linting..."
	uv run ruff check .

.PHONY: check-venv
check-venv:
	@echo "Checking if Python virtual environment is active..."
	@if [ -z "$$VIRTUAL_ENV" ]; then \
		echo "Error: No Python virtual environment is active."; \
		echo "Run 'source .venv/bin/activate' to activate your virtual environment"; \
		exit 1; \
	else \
		echo "Python virtual environment is active."; \
	fi

.PHONY: install-deps
install-deps: check-venv
	@echo "Installing dependencies..."
	cd $(FLASK_API_DIRECTORY) && uv sync

.PHONY: run-pre-commits
run-pre-commits: check-venv
	@echo "Running pre-commit hooks..."
	cd $(FLASK_API_DIRECTORY) && uv run pre-commit run --all-files

.PHONY: update-precommits
update-precommits: check-venv
	@echo "Updating pre-commit hooks..."
	cd $(FLASK_API_DIRECTORY) && uv run pre-commit autoupdate
	cd $(FLASK_API_DIRECTORY) && uv run pre-commit install

.PHONY: bootstrap
bootstrap: check-venv install-deps update-precommits