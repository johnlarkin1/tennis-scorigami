# Contributing to Tennis Scorigami

Thanks for your interest in contributing! We welcome bug fixes, feature ideas, and improvements.

## Getting Started

1. **Open an issue first** — Before starting work, [open an issue](https://github.com/johnlarkin1/tennis-scorigami/issues) to discuss what you'd like to change. This helps avoid duplicate effort and ensures your contribution aligns with the project direction.

2. **Create a branch** — Once your issue is discussed and approved, create a branch off `main`:

   ```bash
   git checkout main
   git pull origin main
   git checkout -b your-branch-name
   ```

3. **Set up locally**:

   ```bash
   npm install
   cp .env.example .env.local
   # Fill in required environment variables
   npm run dev
   ```

## Making Changes

- Keep PRs focused — one feature or fix per PR
- Follow existing code style and conventions
- Use [conventional commits](https://www.conventionalcommits.org/) for commit messages (e.g., `feat:`, `fix:`, `chore:`)

## Before Submitting a PR

Run the following checks locally:

```bash
npm run lint          # ESLint + Prettier
npm run typecheck     # TypeScript compilation
npm test              # Unit tests
```

All three must pass before your PR will be reviewed.

## Submitting a PR

1. Push your branch to the repo
2. Open a pull request against `main`
3. Fill in the PR template with a clear description of your changes
4. Link the related issue

## Code Review

All PRs require review before merging. We may suggest changes or improvements — this is collaborative, not adversarial.

## Questions?

Open an issue or reach out at john@tennis-scorigami.com.
