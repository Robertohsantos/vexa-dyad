# Contributing

Vexa is a fork of Dyad, enhanced with the BMAD protocol and enterprise features. The codebase is rapidly evolving.

Before opening a pull request, please open an issue and discuss whether the change makes sense in Vexa. Ensuring a cohesive user experience sometimes means we can't include every possible feature or we need to consider the long-term design of how we want to support a feature area.

## Working with Claude Code

- Start with `claude` in the project terminal
- Use `/memory` to edit memories and `/hooks` to check hooks
- Follow the principles in `.claude/CLAUDE.md` (SRP, SSOT, DRY, KISS, YAGNI)

## Commits and Pull Requests

- Use Conventional Commits format
- Follow the PR template in `.github/`
- **Important**: Do not include internal terms in PRs (enforced by pr-guard workflow)

## More than code contributions

Something that I really appreciate are all the non-code contributions, such as reporting bugs, writing feature requests and participating in the Vexa community.

## Development

Vexa is an Electron app based on Dyad.

**Install dependencies:**

```sh
npm install
```

**Apply migrations:**

```sh
npm run db:generate
npm run db:push
```

**Run locally:**

```sh
npm start
```

## Testing

### Unit tests

```sh
npm test
```

### E2E tests

Build the app for E2E testing:

```sh
npm run pre:e2e
```

> Note: you only need to re-build the app when changing the app code. You don't need to re-build the app if you're just updating the tests.

Run the whole e2e test suite:

```sh
npm run e2e
```

Run a specific test file:

```sh
npm run e2e e2e-tests/context_manage.spec.ts
```

Update snapshots for a test:

```sh
npm run e2e e2e-tests/context_manage.spec.ts -- --update-snapshots
```
