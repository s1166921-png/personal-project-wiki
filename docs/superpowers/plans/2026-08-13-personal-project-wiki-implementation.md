# Personal Project Wiki Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a public interview portfolio and project knowledge website at `wiki.meiouyuncang.com` that publishes only privacy-reviewed Obsidian content within 5–15 seconds of saving.

**Architecture:** The local Obsidian project library is the full private authoring source. A local export pipeline selects only `visibility: public` pages, strips restricted fields, scans for secrets, and publishes the resulting static VuePress build over HTTPS. Private source documents never enter GitHub or the server release directory.

**Tech Stack:** Obsidian Markdown, Node.js 22+, TypeScript, VuePress 2, Vue 3, Vite, Vitest, chokidar, gray-matter, markdown-it, minisearch, rsync/SSH, Nginx, systemd, Certbot.

## Global Constraints

- Only the configured `个人项目库` content root may be synchronized; never synchronize the complete local vault.
- Default every project to `visibility: private`; publish only explicit `visibility: public` pages and omit `draft: true`.
- Never publish `.env`, credentials, Git metadata, source trees, caches, `node_modules`, or files outside the allowlist.
- Preserve existing Obsidian notes and the existing `知识库` directory.
- Use Monad tokens: Parchment `#f6f3f1`, Off-Black `#242424`, Ash `#cecac8`, Lake Blue `#2b59d1`, Periwinkle `#cfdaf5`, 40px cards, pill controls, serif headings at weight 400.
- Public access must use HTTPS; credentials, IP addresses, local absolute paths, customer data and SSH material must never enter Git or build output.
- Failed validation or builds must retain the last successful online release.
- Normal save-to-live latency target is 5–15 seconds.

---

## Planned File Structure

```text
content/                         # Mirror/export of Obsidian Personal Project Library
site/
  docs/.vuepress/
    client.ts                    # Theme client registration
    config.ts                    # VuePress config, navigation, plugins
    styles/index.scss            # Monad tokens and global styling
    theme/
      index.ts                   # Custom theme entry
      layouts/Layout.vue         # Three-column knowledge layout
      components/ProjectCard.vue # Project summary card
      components/PublicBadge.vue
  tests/                         # Content/theme/build tests
publisher/
  src/config.ts                  # Validated publisher configuration
  src/content-policy.ts          # Path, extension, draft and visibility policy
  src/validate.ts                # Frontmatter and link validation
  src/sync.ts                    # Staged rsync and remote activation trigger
  src/watch.ts                   # Chokidar debounce orchestration
  tests/                         # Publisher unit/integration tests
deploy/
  nginx/wiki.conf                # TLS, auth, headers and static site config
  systemd/wiki-build.service     # One-shot server build
  scripts/build-release.sh       # Atomic release builder
  scripts/rollback.sh            # Previous-release rollback
  robots.txt                     # Public crawler policy
docs/runbooks/
  deploy.md                      # Initial server deployment
  operations.md                  # Publish, backup, recovery and public transition
```

## Milestone A — Obsidian Project Library

### Task 1: Establish the project content schema and templates

**Files:**
- Create: `schemas/project.schema.json`
- Create: `content/99-模板/项目模板.md`
- Create: `content/99-模板/决策模板.md`
- Create: `content/99-模板/周度复盘模板.md`
- Test: `publisher/tests/project-schema.test.ts`

**Interfaces:**
- Produces: JSON schema and Markdown templates consumed by `validateProjectDocument(path, source)`.
- Status enum: `active | waiting | completed | archived`.
- Visibility enum: `private | public`.

- [ ] Write schema tests proving required fields, enum rejection, `draft` boolean validation, and Windows `local_path` acceptance.
- [ ] Run `npm test -- publisher/tests/project-schema.test.ts` and confirm the tests fail because the schema is absent.
- [ ] Implement `schemas/project.schema.json` with `additionalProperties: true` and required fields `title`, `type`, `status`, `area`, `visibility`, `draft`, `created`, `updated`, `local_path`.
- [ ] Add complete templates with all ten required project sections and no placeholder secrets.
- [ ] Run the schema test and confirm all cases pass.
- [ ] Commit with `git commit -m "feat: define project knowledge schema"`.

### Task 2: Create the Obsidian project library navigation

**Files:**
- Create: `content/00-首页/项目总览.md`
- Create: `content/00-首页/本周行动.md`
- Create: `content/02-领域/*.md`
- Create: `content/90-收集箱/README.md`
- Test: `publisher/tests/content-navigation.test.ts`

**Interfaces:**
- Consumes: project schema from Task 1.
- Produces: stable wiki links and landing pages consumed by VuePress navigation generation.

- [ ] Write a test asserting every area page links back to `项目总览` and every project status has a landing section.
- [ ] Run the navigation test and verify the missing pages fail it.
- [ ] Create status-first homepage navigation with area-based secondary navigation.
- [ ] Add an inbox workflow: capture, clarify, promote to a project, or archive.
- [ ] Run the navigation and schema suites and confirm they pass.
- [ ] Commit with `git commit -m "feat: add project library navigation"`.

### Task 3: Inventory all verified projects and subprojects

**Files:**
- Create: `content/01-项目/<status>/<project>.md`
- Create: `content/05-资料/项目盘点方法.md`
- Test: `publisher/tests/inventory-coverage.test.ts`

**Interfaces:**
- Consumes: local filesystem inventory and readable project README/docs without exporting absolute paths.
- Produces: one schema-valid project page for all 17 discovered top-level projects plus independently scoped child projects.

- [ ] Add a failing coverage fixture listing the 17 confirmed top-level directories from the design specification.
- [ ] Run the coverage test and verify it reports every missing project page.
- [ ] Create project cards using only verified filesystem, README, documentation and code evidence; use `待确认` for unknown business state, owner or priority.
- [ ] Create child cards for directories with their own objective or deliverable, beginning with `project-codex`, `new`, `RPA`, and `finance audit`.
- [ ] Run schema, link and inventory coverage tests.
- [ ] Review generated pages for secrets and accidental source-code inclusion.
- [ ] Commit with `git commit -m "content: inventory personal projects"`.

## Milestone B — Monad Knowledge Website

### Task 4: Scaffold the tested VuePress application

**Files:**
- Create: `package.json`, `pnpm-lock.yaml`, `tsconfig.json`
- Create: `site/docs/.vuepress/config.ts`
- Create: `site/docs/.vuepress/client.ts`
- Create: `site/tests/build.test.ts`

**Interfaces:**
- Produces: `pnpm site:build` and static output at `site/docs/.vuepress/dist`.

- [ ] Write a build smoke test requiring generated `index.html`, project routes and a search index.
- [ ] Run `pnpm vitest run site/tests/build.test.ts` and verify it fails before scaffolding.
- [ ] Add pinned VuePress 2, Vue 3, Vite, TypeScript and Vitest dependencies and deterministic scripts.
- [ ] Configure Chinese locale, clean URLs, title metadata, local search and Markdown heading anchors.
- [ ] Build the site and make the smoke test pass.
- [ ] Commit with `git commit -m "feat: scaffold private project wiki"`.

### Task 5: Implement the Monad theme and responsive layouts

**Files:**
- Create: `site/docs/.vuepress/styles/index.scss`
- Create: `site/docs/.vuepress/theme/index.ts`
- Create: `site/docs/.vuepress/theme/layouts/Layout.vue`
- Create: `site/docs/.vuepress/theme/components/ProjectCard.vue`
- Create: `site/docs/.vuepress/theme/components/PrivateBadge.vue`
- Test: `site/tests/theme-contract.test.ts`

**Interfaces:**
- Consumes: VuePress page data and project frontmatter.
- Produces: desktop three-column layout and collapsible mobile navigation.

- [ ] Write contract tests for exact Monad tokens, 40px card radii, pill controls, serif heading weight 400, and absence of card shadows.
- [ ] Run the theme test and confirm it fails before token implementation.
- [ ] Implement theme tokens and the approved `website-concept.html` hierarchy.
- [ ] Implement header search, status/area sidebar, article table of contents, project cards, privacy badge and mobile navigation.
- [ ] Run theme, build and accessibility checks at desktop and mobile widths.
- [ ] Commit with `git commit -m "feat: implement Monad knowledge theme"`.

### Task 6: Generate private and public-safe content views

**Files:**
- Create: `site/scripts/prepare-content.ts`
- Create: `site/src/content-transform.ts`
- Test: `site/tests/content-transform.test.ts`

**Interfaces:**
- Produces: `preparePublicContent(): Promise<PreparedContent>`.
- Public output includes explicit public pages only and strips restricted fields before secret scanning.

- [ ] Write fixtures for private, public and draft documents containing local paths and restricted sections.
- [ ] Write failing tests proving drafts never publish and public output removes `local_path`, private decisions and restricted attachments.
- [ ] Implement deterministic content preparation without mutating source Markdown.
- [ ] Run content transform and public build suites.
- [ ] Commit with `git commit -m "feat: add private and public content builds"`.

## Milestone C — Automatic Publishing

### Task 7: Implement the publisher safety policy

**Files:**
- Create: `publisher/src/config.ts`
- Create: `publisher/src/content-policy.ts`
- Create: `publisher/src/validate.ts`
- Test: `publisher/tests/content-policy.test.ts`
- Test: `publisher/tests/validate.test.ts`

**Interfaces:**
- Produces: `isPublishablePath(root, candidate): PolicyResult` and `validateDocument(path, source): ValidationResult`.

- [ ] Write path traversal, symlink escape, `.env`, Git metadata, `node_modules`, executable attachment, draft and malformed frontmatter rejection tests.
- [ ] Run the policy tests and verify all unsafe fixtures fail before implementation.
- [ ] Implement canonical-path containment and an extension allowlist for Markdown and approved web attachments.
- [ ] Implement frontmatter, internal-link and required-section validation with readable Chinese errors.
- [ ] Run unit tests plus a fixture tree integration test.
- [ ] Commit with `git commit -m "feat: enforce publisher content safety"`.

### Task 8: Implement debounced secure synchronization

**Files:**
- Create: `publisher/src/sync.ts`
- Create: `publisher/src/watch.ts`
- Create: `publisher/src/cli.ts`
- Test: `publisher/tests/watch.test.ts`
- Test: `publisher/tests/sync.test.ts`

**Interfaces:**
- Produces: `createPublisher(config): Publisher`, `Publisher.start()`, `Publisher.publishNow()`.
- Remote contract: upload into a unique staging directory and invoke the one-shot build service only after validation succeeds.

- [ ] Write fake-timer tests showing burst saves collapse into one publish and failed validation invokes no transfer.
- [ ] Write a fake-process integration test asserting rsync arguments use the allowlisted source and staging destination.
- [ ] Implement chokidar watching with a two-second debounce and a single-flight publish lock.
- [ ] Implement rsync/SSH execution with structured logs, exit-code handling and no credentials in command output.
- [ ] Run watcher, sync and safety suites.
- [ ] Commit with `git commit -m "feat: add automatic secure publishing"`.

## Milestone D — Server, DNS and Operations

### Task 9: Implement atomic server builds and rollback

**Files:**
- Create: `deploy/scripts/build-release.sh`
- Create: `deploy/scripts/rollback.sh`
- Create: `deploy/systemd/wiki-build.service`
- Test: `deploy/tests/release.bats`

**Interfaces:**
- Produces: immutable timestamped releases, `current` symlink, `previous` symlink and exit status consumed by the publisher.

- [ ] Write Bats tests for successful activation, failed-build retention, and rollback to the prior release.
- [ ] Run tests and verify scripts are absent.
- [ ] Implement dependency install, static build, link check, atomic symlink swap and bounded release retention.
- [ ] Implement rollback and locked single-run systemd service.
- [ ] Run Bats tests in a temporary release root.
- [ ] Commit with `git commit -m "feat: add atomic wiki releases"`.

### Task 10: Configure HTTPS, public access and secure headers

**Files:**
- Create: `deploy/nginx/wiki.conf`
- Create: `deploy/robots.txt`
- Test: `deploy/tests/nginx-contract.test.ts`

**Interfaces:**
- Produces: Nginx virtual host for `wiki.meiouyuncang.com` serving the `current` release.

- [ ] Write tests requiring HTTP-to-HTTPS redirect, public 200 access, security headers and an explicit public `/robots.txt` policy.
- [ ] Run the contract test and verify it fails before configuration exists.
- [ ] Implement Nginx configuration without embedding credentials or certificate private keys.
- [ ] Validate with `nginx -t` in the deployment environment and run HTTP assertions for 401/200 behavior.
- [ ] Commit with `git commit -m "feat: secure private wiki ingress"`.

### Task 11: Deploy, connect DNS and verify end to end

**Files:**
- Create: `docs/runbooks/deploy.md`
- Create: `docs/runbooks/operations.md`
- Create: `scripts/e2e-publish-check.mjs`

**Interfaces:**
- Consumes: server and DNS settings supplied through local-only deployment configuration plus a restricted deploy account.
- Produces: live public site and repeatable operations runbook.

- [ ] Verify current DNS, server OS, Nginx ownership, open ports and available disk before mutation.
- [ ] Create the `wiki` DNS record from local-only deployment configuration and wait for authoritative confirmation.
- [ ] Provision a restricted site user, release directories, systemd service and Nginx host.
- [ ] Request and verify the TLS certificate.
- [ ] Configure the local publisher using local-only environment configuration.
- [ ] Run the end-to-end check: public request returns 200, draft and private pages never appear, a safe edit appears within 15 seconds, and a forced failed build leaves the old release online.
- [ ] Document backup, password rotation, rollback, update and future public-build procedures.
- [ ] Commit with `git commit -m "docs: add wiki deployment runbooks"`.

## Final Verification Gate

- [ ] Run all unit, integration, theme, build, policy, release and Nginx contract tests with zero failures.
- [ ] Build the public variant and compare it against source fixtures to prove private pages and restricted fields do not exist in output.
- [ ] Search the repository history and working tree for credentials, private keys, `.env` contents and server passwords.
- [ ] Verify all 17 top-level projects are represented and all content documents pass schema/link validation.
- [ ] Repeat cold-start publish and rollback tests from the runbook.
- [ ] Record final versions, deployment date, backup location and verified recovery procedure in `docs/runbooks/operations.md`.
