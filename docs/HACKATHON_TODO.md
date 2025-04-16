# CRE-Debt-Solana Hackathon TODO List

A 30-day detailed action plan. Check off tasks as you complete them.

---

## Phase 1: MVP Foundation (Days 1-10)

### Days 1-2: Project Setup & Planning
- [ ] Initialize GitHub repo:
  1. Go to **GitHub** and click **New repository**, name it `cre-debt-solana`, choose visibility.
  2. Clone: `git clone git@github.com:yourusername/cre-debt-solana.git` & `cd cre-debt-solana`.
  3. Create a `.gitignore` at root with entries for Rust (`target/`) and Node (`node_modules/`).
  4. Commit & push: 
     ```bash
     git add .gitignore
     git commit -m "chore: add gitignore"
     git push origin main
     ```
  5. In GitHub **Settings → Branches**, add protection rules for `main` (require status checks).
  6. Add CI stub at `.github/workflows/ci.yml`:
     ```yaml
     name: CI
     on: [push, pull_request]
     jobs:
       build:
         runs-on: ubuntu-latest
         steps:
           - uses: actions/checkout@v2
           - name: Build Contracts
             run: cd programs/loan-core && anchor build
           - name: Build API
             run: cd api && yarn install && yarn build
           - name: Build Frontend
             run: cd app && yarn install && yarn build
     ```
- [ ] Setup local dev environment:
  1. Install **Docker Desktop** (enable WSL2 backend on Windows).
  2. Create `docker-compose.yml`:
     ```yaml
     version: '3.8'
     services:
       postgres:
         image: postgres:14
         ports: ['5432:5432']
         environment:
           POSTGRES_USER: dev
           POSTGRES_PASSWORD: secret
           POSTGRES_DB: cre_debt
     ```
  3. Run: `docker-compose up -d`.
  4. Verify: `docker exec -it <postgres-container> psql -U dev -d cre_debt`.
  5. Install **Solana CLI**:
     ```bash
     sh -c "$(curl -sSfL https://release.solana.com/v1.16.0/install)"
     ```
  6. Start local validator: `solana-test-validator --reset`
- [ ] Create `scripts/start-dev.sh`:
  1. In `scripts/`, add:
     ```bash
     #!/bin/bash
     docker-compose up -d
     solana-test-validator --reset &
     (cd programs/loan-core && anchor build)
     (cd api && yarn install && yarn start) &
     (cd app && yarn install && yarn start) &
     ```
  2. `chmod +x scripts/start-dev.sh`
  3. Run: `./scripts/start-dev.sh` and confirm services start.
- [ ] Kickoff meeting:
  1. Schedule via Calendar; invite Smart‑Contract, Backend, Frontend leads.
  2. Prepare agenda in `docs/notes/kickoff.md`.
  3. Record action items and owners.
- [ ] Finalize tech architecture:
  1. Update `docs/technical-architecture.md` with revised diagrams.
  2. Use draw.io or Lucidchart; export to `docs/architecture/overview.png`.
  3. Commit assets and update markdown.
- [ ] Establish coding standards:
  1. Add `.eslintrc.json` in `/api` and `/app` with recommended configs.
  2. Add `.prettierrc` at root.
  3. Run `rustup component add rustfmt clippy` and add `cargo fmt` to CI.
  4. Create `commitlint.config.js` for conventional commits.

### Days 3-5: Core Smart Contract Development
- [ ] Define account structs:
  1. Open `programs/loan-core/src/state/loan.rs`.
  2. Paste `Loan` struct from spec; add `#[account]` and PDA seeds.
  3. Repeat for `Payment` and `PlatformConfig` in their respective files.
  4. Run `anchor build` to verify compilation.
- [ ] Implement instruction contexts:
  1. In `lib.rs`, register modules: `pub mod instructions;`.
  2. Create `instructions/create_loan.rs`: define `#[derive(Accounts)]` and handler.
  3. Wire in `create_loan` in `#[program]` macro.
  4. Repeat for `approve_loan`, `fund_loan`, and `process_payment`.
- [ ] Add error definitions:
  1. Open `error.rs`, define `#[error_code] pub enum ErrorCode { Unauthorized = 6000, ... }`.
  2. In handlers, return `Err(ErrorCode::Unauthorized.into())` where needed.
- [ ] Integrate USDC CPI adapter:
  1. Add `anchor-spl = "0.27.0"` under `[dependencies]` in `Cargo.toml`.
  2. In `fund_loan`, import and call `transfer` from `anchor_spl::token`.
- [ ] Write Anchor unit tests:
  1. Under `programs/loan-core/tests/`, create `create_loan.ts`.
  2. Use `anchor workspace.loan_core` and `provider` to call RPC.
  3. Assert state changes with `program.account.loan.fetch(loanPubkey)`.
  4. Add tests for edge cases (over-LTV, unauthorized).
  5. Run `anchor test` and resolve failures.

### Days 6-8: Smart Contract Core Functionality
- [ ] Build `property-registry` program:
  1. `anchor init property-registry --javascript=false`.
  2. Define `Property` struct in `state.rs` and annotate.
  3. Implement `create_property` & `verify_property` in `instructions/`.
  4. Write tests in `tests/property.ts` and run.
- [ ] Build `borrower-registry` program:
  1. `anchor init borrower-registry`.
  2. Define `Borrower` struct and instructions.
  3. Create tests and ensure passing.
- [ ] Payment schedule logic:
  1. In `fund_loan`, compute `next_payment_due` using `Clock::get()`.
  2. Enforce due date in `process_payment` handler.
- [ ] Emit events:
  1. Define `#[event] pub struct LoanCreated { pub id: String }`.
  2. Call `emit!(LoanCreated { id: loan.loan_id.clone() })`.
- [ ] Expand multi-program tests:
  1. Write integration script calling registry + loan programs.
  2. Verify cross-program CPI and state consistency.

### Days 9-10: Backend & Frontend Foundation
#### Backend
- [ ] Initialize project:
  1. `mkdir api && cd api && yarn init -y`.
  2. `yarn add express typescript ts-node prisma @prisma/client zod`.
  3. Create `tsconfig.json` targeting `ES2020`.
- [ ] Data models & migrations:
  1. Define models in `prisma/schema.prisma`.
  2. Run `npx prisma migrate dev --name init`.
  3. Create `prisma/seed.ts` with sample data.
- [ ] Solana service wrapper:
  1. Install `@project-serum/anchor`.
  2. In `src/services/solana.ts`, load IDL, create `anchor.Program` instance.
- [ ] CRUD endpoints:
  1. Create `controllers/loan.ts` with `createLoan`, `approveLoan`, `fundLoan` functions.
  2. Register routes in `routes/loan.ts`.
  3. Repeat for `properties` and `borrowers`.
- [ ] Validation & errors:
  1. Define Zod schemas in `schemas/`.
  2. Add validation middleware using `zod.parseAsync()`.
  3. Standardize error responses in `errorHandler.ts`.

#### Frontend
- [ ] Initialize React app:
  1. `mkdir app && cd app && yarn create vite . --template react-ts`.
  2. `yarn add axios @mui/material @emotion/react @emotion/styled`.
- [ ] Wallet connect:
  1. `yarn add @solana/wallet-adapter-react @solana/wallet-adapter-wallets @solana/wallet-adapter-react-ui`.
  2. Setup `WalletProvider` in `main.tsx`.
- [ ] API service layer:
  1. Create `services/api.ts`: `axios.create({ baseURL: import.meta.env.VITE_API_URL })`.
  2. Add interceptors for JWT auth.
- [ ] Skeleton pages:
  1. Create `pages/Home.tsx` with Connect button.
  2. Create `pages/ApplyLoan.tsx` form using MUI components.
  3. Create `pages/Dashboard.tsx` to fetch and list loans.

## Phase 2: Core Platform (Days 11-20)

### Days 11-13: Enhancement & Features
- [ ] **Smart Contracts**:
  1. Open `programs/loan-core/src/state/config.rs`, add fields `interest_rate_bps: u16`, `origination_fee_bps: u16` to `PlatformConfig`.
  2. In `lib.rs`, register `update_config` under `#[program]` macro.
  3. Create `instructions/update_config.rs`:
     - Derive `#[derive(Accounts)]` with `admin: Signer` and `platform_config: Account<PlatformConfig>`.
     - In handler, check `admin.key() == platform_config.admin`; update fields; emit `ConfigUpdated` event.
  4. Write unit test `programs/loan-core/tests/update_config.ts`:
     - Initialize config, call `update_config`, assert new rates; test unauthorized access.
- [ ] **Backend**:
  1. In `api/src/services/propertyValuation.ts`, implement `getPropertyValuation(address: string)` with Axios to call a mock API endpoint.
  2. Create `api/src/services/docService.ts`, add `generateLoanDocument(loanId)` using DocuSign SDK with credentials from `.env`.
  3. In `api/src/services/notificationService.ts`, configure Nodemailer; export `sendEmailNotification(to, subject, body)`. Add webhook handler in `api/src/routes/webhooks.ts`.
  4. Add admin routes in `api/src/routes/admin.ts`:
     - `GET /admin/config` → fetch `PlatformConfig` from DB.
     - `PATCH /admin/config` → accept JSON `{interest_rate_bps, origination_fee_bps}`, call Solana `update_config` and update DB.
- [ ] **Frontend**:
  1. Build `app/src/pages/BorrowerDashboard.tsx`:
     - Use API service to `GET /loans?borrowerId=${wallet.publicKey}`; render MUI `Table` of loans.
  2. Create `app/src/pages/PropertySubmission.tsx`:
     - Add MUI `TextField` for address, `Button` for file upload; submit to `POST /properties`.
  3. Enhance `app/src/pages/ApplyLoan.tsx` with Zod schema:
     - Validate `principal`, `term`; display errors via MUI `FormHelperText`.
  4. Add `app/src/components/DocumentPreview.tsx`:
     - Accept `fileUrl`; render PDF preview via `<object>` or `<iframe>`.

### Days 14-17: Workflow Integration
- [ ] Connect frontend → backend → blockchain:
  1. In `app/src/services/api.ts`, implement `originateLoan(data)` that calls `POST /loans`, then `POST /loans/${loanId}/fund`.
  2. In `app/src/components/LoanOrigination.tsx`, wire `originateLoan`, show loading and success states.
- [ ] Automate USDC transfer on funding:
  1. In `app/src/components/Funding.tsx`, import `useWallet` and `transfer` from `@solana/spl-token`.
  2. Build transfer instruction with source, destination, amount; sign via wallet adapter; send transaction.
  3. After tx confirmation, call backend `PATCH /loans/${loanId}/approve`.
- [ ] Implement KYC mock flow:
  1. Create `app/src/pages/KYCFlow.tsx`: form to submit name/ID; call `POST /borrowers/{id}/kyc`.
  2. Poll `GET /borrowers/{id}` until status is `APPROVED`; display MUI `Chip` colored by status.
- [ ] Automate UCC filing doc generation:
  1. In `api/src/services/uccService.ts`, add `generateUCC(loanId)` using `pdf-lib` to fill a PDF template.
  2. Expose `POST /ucc/:loanId` to return PDF and store UCC record in DB.
- [ ] Build error recovery & retry logic:
  1. Install `axios-retry`; configure in `app/src/services/api.ts` for idempotent calls.
  2. In UI components, display retry count and provide manual retry button on failure.
- [ ] Write integration tests:
  1. Create `tests/integration/loanLifecycle.test.ts` with Jest & `@solana/web3.js`: simulate full flow from property registration to payment.
  2. Assert on-chain and DB state after each step.

### Days 18-20: Enhanced Features & Analytics
- [ ] Analytics dashboard prototype:
  1. Build `app/src/components/AnalyticsDashboard.tsx` using Chart.js.
  2. Fetch `GET /analytics/loans` and `GET /analytics/payments`; render bar and line charts.
- [ ] Loan calculator utility:
  1. Add `app/src/utils/loanCalculator.ts`: function `(principal, rate, term) => amortization schedule array`.
  2. Integrate calculator in `ApplyLoan` page to preview payment schedule.
- [ ] Optimize backend performance:
  1. Install `node-cache` or Redis in `api`; add caching middleware `api/src/middleware/cache.ts` for `/analytics`.
  2. Implement pagination parameters `?page` & `?limit` in list endpoints.
- [ ] Implement payment reminders:
  1. Extend `notificationService` to `sendSMS` via Twilio (credentials in `.env`).
  2. Use `node-cron` in `api/src/cron/reminderJob.ts` to schedule daily SMS/email for payments due within 48 hrs.
- [ ] Update documentation:
  1. Modify `docs/hackathon-workplan.md` with new API endpoints and sequence diagrams.
  2. Add examples to `README.md`.
  3. Generate updated OpenAPI spec at `api/docs/openapi.yml`.

## Phase 3: Production Readiness (Days 21-30)

### Days 21-24: Security & Quality Assurance
- [ ] Conduct internal smart contract audit & fix findings:
  1. Install & run `cargo audit` and `solana-auditor`; save report as `docs/audit-report.md`.
  2. Review vulnerabilities by severity; document issues in `docs/audit-findings.md`.
  3. Apply fixes; run `anchor test`; commit changes.
- [ ] Perform penetration testing on API endpoints:
  1. Install OWASP ZAP CLI (`npm install -g zaproxy`).
  2. Run `zap-baseline.py -t http://localhost:3000 -r zap-report.html`.
  3. Address high/medium vulnerabilities; retest and update `docs/pt-report.md`.
- [ ] Run load/performance tests (Artillery, JMeter):
  1. Create `tests/perf/artillery.yml` simulating 100 concurrent users.
  2. Execute `artillery run tests/perf/artillery.yml --output perf.json`.
  3. Analyze latency & throughput; optimize slow endpoints.
- [ ] Review & enhance error handling and logging:
  1. Audit API controllers for missing try/catch; wrap with uniform error handler.
  2. Map on-chain errors to HTTP codes in API.
  3. Add log statements using `winston` (API) & `tracing` (Rust).
- [ ] Configure monitoring & alerts (Prometheus/Grafana):
  1. Add Prometheus exporter in `api/src/app.ts` using `prom-client`.
  2. Deploy `prometheus.yml` via Docker Compose.
  3. Create Grafana dashboards; set alerts for error rate >5% & latency >200ms.

### Days 21-24: UI/UX Refinement
- [ ] Conduct UX testing sessions & collect feedback:
  1. Recruit 5 users; prepare tasks in Figma prototype.
  2. Conduct moderated sessions; record via Zoom.
  3. Log feedback in `docs/ux/feedback.md`; triage issues.
- [ ] Polish component styling and animations:
  1. Review MUI theme (`app/src/theme.ts`); update color/shadow tokens.
  2. Add `framer-motion` transitions for page navigation.
  3. Refine button hover/active/disabled states.
- [ ] Ensure accessibility (WCAG) and keyboard support:
  1. Run `eslint-plugin-jsx-a11y`; fix reported issues.
  2. Add `aria-label`s and proper `role` attributes.
  3. Test with NVDA/VoiceOver; ensure focus order.
- [ ] Improve page load and transition states:
  1. Implement code-splitting with `React.lazy` & `Suspense`.
  2. Lazy-load images (`loading="lazy"`).
  3. Measure TTI in Lighthouse; target <2s.
- [ ] Finalize design system docs:
  1. Publish Storybook at `docs/storybook`.
  2. Add component usage examples to `docs/project-structure.md`.

### Days 25-27: Final Integration & Testing
- [ ] End-to-end tests with Cypress across flows:
  1. Configure `cypress.json` with `baseUrl`.
  2. Write specs in `cypress/integration/origination.spec.js`.
  3. Run `npx cypress run`; fix failures.
- [ ] Cross-browser compatibility testing:
  1. Integrate BrowserStack in Cypress (`npm install --save-dev browserstack-cypress`).
  2. Run tests on Chrome, Firefox, Safari, Edge.
  3. Document UI issues in `docs/compatibility.md`.
- [ ] Test edge cases: disrupted networks, corrupted inputs:
  1. Simulate offline mode in devtools; verify graceful UI errors.
  2. Send malformed JSON to API; confirm error handling.
  3. Record findings in `docs/edge-cases.md`.
- [ ] Final walkthrough & sign-off checklist:
  1. Create `docs/checklist/signoff.md` with feature, test, doc items.
  2. Review with team; capture approvals in comments.
  3. Merge `release/v1.0` into `main`; tag `v1.0`.

### Days 28-30: Packaging & Presentation
- [ ] Prepare demo video & slide deck:
  1. Draft script covering core workflows & features.
  2. Record with OBS; edit in DaVinci Resolve.
  3. Export MP4; upload to Drive; link in `docs/demo.md`.
- [ ] Deploy backend (Heroku/AWS Lambda) & frontend (Vercel):
  1. Create Heroku app; add `Procfile`; set env vars; `git push heroku main`.
  2. Create Vercel project; configure secrets; deploy `app`.
  3. Verify live URLs; update `README.md`.
- [ ] Configure CI/CD for build, test, and deploy:
  1. Add `deploy-backend.yml` & `deploy-frontend.yml` in `.github/workflows`.
  2. Store secrets in GitHub settings.
  3. Validate pipeline on PR merge; fix issues.
- [ ] Finalize README, docs, and Hackathon submission package:
  1. Update badges (build, coverage, version) in `README.md`.
  2. Ensure all `docs/` links are correct.
  3. Zip code + `docs/` + demo into `hackathon_submission.zip`.
- [ ] Create investor pitch deck and future roadmap:
  1. Outline slides: problem, solution, traction, roadmap.
  2. Design in PowerPoint/Keynote; export PDF.
  3. Save as `docs/pitch-deck.pdf`.

---

Good luck—focus on one phase at a time and iterate quickly.
