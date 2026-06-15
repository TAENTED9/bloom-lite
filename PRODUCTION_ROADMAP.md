# Bloom — Production Readiness Roadmap

**From working prototype to a real-world, cross-border money movement product.**

This document is a complete inventory of what is required to take *Bloom Lite* (the current prototype) to a production-grade, regulated, long-lived remittance product. It is organised by domain, prioritised into phases, and mapped back to the current codebase so nothing is hand-waved.

> ⚠️ **Important:** Several items below (licensing, KYC/AML, money transmission, custody of customer funds, crypto/stablecoin handling) are **legally mandatory** before you can move a single unit of real customer money. The compliance sections are written to brief a fintech/financial-services lawyer — they are **not** legal advice. Engage qualified counsel in every operating jurisdiction before launch.

---

## 1. Executive summary

The prototype proves the **product experience**: sign up, see a balance, send money across a corridor (Japan ⇄ Nigeria today), confirm with a live preview, and view history — all with no crypto jargon in the UI. It demonstrates the *flow*, not the *rails*.

To make this a real product, three things must become real:

1. **The money must actually move** — the prototype simulates the swap and seeds fake balances. Production needs real pay-in, real FX/liquidity, real pay-out, and a correct ledger.
2. **It must be legal** — cross-border money transfer is one of the most heavily regulated activities there is. Licensing, KYC, AML, and sanctions screening are prerequisites, not features.
3. **It must be trustworthy and durable** — custody of keys and funds, security, reliability, support, and data protection at a standard customers and regulators will accept.

Everything below expands those three into an actionable checklist.

---

## 2. Current state — what the prototype is and is not

| Area | Prototype today | Production reality needed |
|---|---|---|
| Money movement | **Simulated.** `lib/jupiter.ts` mocks the swap; no on-chain transaction is submitted. `lib/solana.ts` is **devnet-only** with test airdrops. | Real pay-in, FX/liquidity, settlement, pay-out. |
| Balances | **Seeded.** Every JP account starts at ¥150,000 (`services/walletService.ts`); NGN starts at ₦0. | Balances backed by real funds in a real ledger. |
| FX rates | **Hardcoded** in `lib/fx.ts` (¥155/USDC, ₦1580/USDC). | Live rates from a liquidity/FX provider, with spread & expiry. |
| Custody | Private keys generated client-side of the server, **encrypted (AES-256-GCM) and stored in the database**; single key from one `ENCRYPTION_KEY` env var (`lib/encryption.ts`). | HSM / KMS / MPC custody; keys never in app DB; rotation, quorum, audit. |
| Database | **SQLite** local file (`prisma/dev.db`). | Managed Postgres with backups, replication, migrations. |
| Auth | JWT in an httpOnly cookie, 7-day expiry, bcrypt password hashing. No MFA, no refresh/rotation, no lockout. | MFA, session lifecycle, device management, rate limiting, lockout. |
| Identity | **None.** Anyone can register with an email; no identity verification. | Full KYC/CDD at onboarding, tiered by limits. |
| Compliance | **None.** No AML, no sanctions screening, no reporting. | Licensed entity + full AML/CFT program. |
| Fees & limits | Fee is ¥0 ("Prototype"); amount bounded only by a Zod check (100–500,000). | Real pricing, risk-based limits, disclosures. |
| Corridors | Japan ⇄ Nigeria only; others marked "coming soon" in `lib/countries.ts`. | Multiple corridors, each separately licensed & integrated. |
| Secrets | `.env` file (`JWT_SECRET`, `ENCRYPTION_KEY`, RPC URL). | Managed secrets store, rotation, least privilege. |

**Bottom line:** the prototype is an excellent, demoable front-of-house. The vault, the cash, the tellers, the licences, and the auditors do not exist yet.

---

## 3. Regulatory, Licensing & Compliance  *(blocking — do this first)*

Cross-border remittance = **money transmission** + (because of stablecoin rails) likely **virtual asset service provision**. You need authorisation in each jurisdiction where you touch customer money.

### 3.1 Licensing & registration (per operating jurisdiction)
- [ ] **Japan** — Funds Transfer Service Provider registration under the Payment Services Act (Type I/II/III determine per-transfer limits), via the Financial Services Agency (FSA) / local finance bureau.
- [ ] **Japan (crypto/stablecoin)** — if stablecoins are used, Crypto-Asset Exchange Service Provider registration and/or compliance with the "Electronic Payment Instruments" regime (amended PSA, 2023).
- [ ] **Nigeria** — International Money Transfer Operator (IMTO) approval from the Central Bank of Nigeria (CBN); partner with CBN-licensed banks for naira payout; track evolving CBN/SEC digital-asset rules.
- [ ] **Any US nexus** — FinCEN Money Services Business (MSB) registration **and** state-by-state Money Transmitter Licenses (MTLs).
- [ ] **EU/UK nexus** — EMI/PI authorisation (e.g., FCA in the UK; an EMI/PI licence under PSD2/EMD in the EU).
- [ ] **Surety bonds, minimum capital, and net-worth requirements** per regulator.
- [ ] **Regulatory reporting cadence** established (periodic returns, transaction reports).

### 3.2 KYC / Customer Due Diligence (CDD)
- [ ] Identity verification at onboarding: government ID capture + document authenticity check.
- [ ] Liveness / selfie biometric match (anti-spoofing).
- [ ] Proof of address where required.
- [ ] Sender **and** recipient information capture (name, DOB, address, ID).
- [ ] Enhanced Due Diligence (EDD) for high-risk customers / large amounts.
- [ ] Tiered verification levels tied to transaction limits.
- [ ] Periodic re-verification / KYC refresh.
- [ ] Integrate a KYC/identity vendor (e.g., Onfido, Persona, Sumsub, Smile ID for Africa).

### 3.3 AML / CFT program
- [ ] Written AML/CFT policy and a designated Compliance/MLRO officer.
- [ ] **Sanctions screening** against OFAC, UN, EU, UK and local lists — at onboarding **and** per transaction.
- [ ] **PEP (Politically Exposed Persons) screening.**
- [ ] **Transaction monitoring** with rules + anomaly detection (structuring, velocity, unusual corridors).
- [ ] Suspicious Activity / Transaction Report (SAR/STR) filing workflow.
- [ ] Currency/large-transaction reporting thresholds.
- [ ] **FATF Travel Rule** compliance for the crypto leg (originator/beneficiary data sharing between VASPs).
- [ ] Risk-based customer risk scoring.
- [ ] Record-keeping retention (typically 5+ years) for all KYC and transaction data.
- [ ] Independent AML audit / model validation.

### 3.4 Consumer protection & disclosures
- [ ] Pre-transaction disclosure of **exact** fees, FX rate, amount received, and delivery time (US Remittance Rule / Reg E style; equivalents elsewhere).
- [ ] Receipts and cancellation/refund rights window.
- [ ] Error-resolution and dispute procedures.
- [ ] Clear, jurisdiction-appropriate Terms of Service and Privacy Policy.
- [ ] Complaints handling process and regulator escalation path.

---

## 4. Payments & Money-Movement Infrastructure  *(the real "rails")*

Replaces the simulated swap and seeded balances.

### 4.1 Pay-in (funding)
- [ ] Bank transfer / local payment methods for the send country (e.g., furikomi/Pay-easy in Japan).
- [ ] Card funding (with PCI-DSS scope handled by a tokenising processor).
- [ ] Open-banking / direct-debit where available.
- [ ] Funding confirmation + reconciliation before release.

### 4.2 FX & liquidity
- [ ] Live FX rates with provider redundancy (replace hardcoded `lib/fx.ts`).
- [ ] Quote **locking & expiry** (a rate the customer accepts must be honoured for a fixed window).
- [ ] Spread / margin model as a revenue lever.
- [ ] Liquidity sourcing and hedging for FX exposure.
- [ ] If using stablecoins: real on-chain execution, slippage controls, MEV protection, gas/fee management, and on/off-ramp partners.

### 4.3 Pay-out (delivery)
- [ ] **Bank deposit** to recipient accounts (NGN via CBN-licensed bank partner).
- [ ] **Mobile money / wallets** (critical in many African corridors).
- [ ] Cash pickup network (optional).
- [ ] Payout status webhooks and failure/return handling.

### 4.4 Ledger, settlement & accounting
- [ ] **Double-entry ledger** as the source of truth (the current `balanceFiat` field is not an accounting system).
- [ ] Idempotency keys on every money-moving operation; exactly-once semantics.
- [ ] Settlement & reconciliation against bank/provider statements.
- [ ] Treasury management (float, nostro/vostro, pre-funding).
- [ ] Immutable transaction audit trail.
- [ ] Handling of partial failures, reversals, refunds, and chargebacks.
- [ ] Daily close, ledger integrity checks, and financial reporting feeds.

---

## 5. Custody, Keys & Crypto  *(if stablecoin rails are kept)*

The single most security-critical area. Today a private key is AES-encrypted with one app-level key and **stored in the application database** — acceptable for a devnet demo, unacceptable for real funds.

- [ ] Move key custody out of the app DB to **HSM, cloud KMS, or MPC** (e.g., Fireblocks, AWS/GCP KMS + nitro enclaves, or a qualified custodian).
- [ ] Keys must never be decryptable by the application server alone (quorum / threshold signing).
- [ ] Key generation, storage, rotation, and destruction policy with audit logging.
- [ ] Cold/hot wallet separation; withdrawal limits and approvals.
- [ ] Mainnet RPC with redundancy and monitoring (replace devnet-only `lib/solana.ts`).
- [ ] On-chain transaction monitoring, confirmation tracking, and re-org handling.
- [ ] Stablecoin issuer/counterparty risk assessment (depeg, freeze, redemption).
- [ ] Smart-contract / swap-route security audit before any mainnet value moves.
- [ ] Insurance for custodied assets where available.
- [ ] **Decision to make:** keep a crypto/stablecoin settlement layer (adds VASP licensing + custody burden) vs. settle purely through banking partners. This is a foundational architecture choice — document the rationale.

---

## 6. Security & Application Hardening

- [ ] **Secrets management** — move `JWT_SECRET`, `ENCRYPTION_KEY`, RPC URLs out of `.env` into a managed secret store (AWS Secrets Manager, GCP Secret Manager, Vault) with rotation.
- [ ] **MFA** (TOTP/passkeys) for login and for high-risk actions (new recipient, large transfer).
- [ ] Auth lifecycle: short-lived access tokens + refresh-token rotation, server-side session revocation, device/session management (today: a single 7-day JWT).
- [ ] **Step-up authentication** before confirming a transfer.
- [ ] Rate limiting, brute-force lockout, and bot/abuse protection on auth and transfer endpoints.
- [ ] Account-takeover protections: new-device alerts, suspicious-login detection.
- [ ] Input validation everywhere (Zod is a good start) + output encoding; CSRF protection; strict CORS.
- [ ] Security headers / CSP, HSTS, secure cookie flags in production.
- [ ] Encryption in transit (TLS everywhere) and at rest (DB, backups, logs).
- [ ] **Fraud engine** — risk scoring per transaction, device fingerprinting, velocity checks.
- [ ] Third-party **penetration test** and code/security audit before launch; recurring thereafter.
- [ ] **Bug bounty** / responsible disclosure program.
- [ ] Dependency scanning (SCA), SAST/DAST in CI, and secret scanning.
- [ ] Principle of least privilege for all infra and DB access; audit logging of admin actions.

---

## 7. Data, Privacy & Records

- [ ] Data protection compliance per jurisdiction: **GDPR/UK GDPR**, **Japan APPI**, **Nigeria NDPA/NDPR**.
- [ ] Lawful basis, consent management, and a published Privacy Policy.
- [ ] Data subject rights (access, deletion, portability) — balanced against AML retention duties.
- [ ] PII minimisation, field-level encryption for sensitive data, tokenisation.
- [ ] Data residency requirements (some regulators require local storage).
- [ ] Retention schedules (KYC/transaction records often 5–7 years).
- [ ] Vendor/data-processor agreements (DPAs) with every sub-processor.
- [ ] Breach notification process and timelines.

---

## 8. Engineering & Infrastructure

- [ ] **Database → managed Postgres** (schema already Postgres-ready per comments in `prisma/schema.prisma`): connection pooling, read replicas, automated backups, point-in-time recovery, and **migration strategy** (no more `db push` to a file).
- [ ] Multiple environments: **dev → staging → production**, with seeded test data only outside prod.
- [ ] Infrastructure as Code (Terraform/Pulumi); reproducible, reviewable infra.
- [ ] CI/CD with automated tests, build, and gated deploys; rollback strategy.
- [ ] Containerisation/orchestration as needed; autoscaling and load balancing.
- [ ] Async processing: queues/workers for payouts, webhooks, notifications, screening (money movement should not be synchronous in a request handler).
- [ ] **API versioning**, contracts, and backward-compatibility policy.
- [ ] Idempotency and retry/circuit-breaker patterns for all external providers.
- [ ] Caching strategy where safe (never for balances/ledger truth).
- [ ] Feature flags for safe rollout of corridors/features.

---

## 9. Reliability, Observability & Operations

- [ ] Centralised **structured logging** (with PII redaction).
- [ ] **Metrics & dashboards** (latency, error rates, transfer success rate, payout SLAs).
- [ ] **Distributed tracing** across services and providers.
- [ ] **Error tracking** (Sentry-style) with alerting.
- [ ] On-call rotation, incident response runbooks, and post-mortems.
- [ ] **Public status page** and customer comms for incidents.
- [ ] Defined **SLAs/SLOs** and uptime targets.
- [ ] **Disaster recovery** plan with tested RTO/RPO; multi-region/failover for critical paths.
- [ ] Business continuity plan (provider outage = funds in flight; you need a playbook).
- [ ] Reconciliation alerts (ledger vs. bank/chain mismatches must page someone).

---

## 10. Core Product Features (user-facing)

These build on the existing dashboard, send, history, and settings pages.

### 10.1 Onboarding & account
- [ ] Guided KYC onboarding flow with progress and re-try.
- [ ] Email **and** phone verification.
- [ ] Account tiers / limits surfaced to the user.
- [ ] Profile completeness and document expiry reminders.

### 10.2 Sending money
- [ ] **Recipient management / address book** (save, edit, reuse recipients; bank/mobile-money details).
- [ ] Real fee & rate breakdown with **locked quotes** and countdown.
- [ ] Multiple payout methods per corridor (bank, mobile money, cash).
- [ ] Scheduled and recurring transfers.
- [ ] Transfer tracking with real status (initiated → funded → converting → paying out → delivered).
- [ ] Cancellation within the allowed window; refunds.
- [ ] Per-transaction **receipts** (PDF/email) and shareable confirmation.
- [ ] Limits and friendly limit-reached messaging.

### 10.3 Engagement & retention
- [ ] **Notifications**: email + SMS + push for every state change.
- [ ] Referral / rewards program.
- [ ] Promotional/first-transfer rate offers.
- [ ] Saved beneficiaries' delivery-time estimates.

### 10.4 Reach & accessibility
- [ ] **Localisation / i18n** (Japanese, English, and recipient-market languages) and locale-correct currency formatting (already centralised in `lib/fx.ts`).
- [ ] **Native mobile apps** (iOS/Android) or PWA — the audience is mobile-first.
- [ ] **Accessibility (WCAG 2.1 AA)**: keyboard nav, screen-reader labels, contrast, focus states.
- [ ] Offline/poor-connectivity resilience for emerging-market users.

### 10.5 Support & trust
- [ ] In-app help centre / FAQ.
- [ ] Live chat / ticketing and a clear dispute path.
- [ ] Transparent corridor coverage, rates, and delivery times page.
- [ ] Trust signals: security page, licences, regulator registrations, certifications.

---

## 11. Quality & Testing

- [ ] Unit tests for services (FX conversion, swap logic, auth) — currently none.
- [ ] Integration tests for API routes and DB.
- [ ] End-to-end tests for the critical flows (register → KYC → send → payout → history).
- [ ] **Money-path tests**: idempotency, double-spend, partial failure, reversal, reconciliation.
- [ ] Load / stress testing for peak corridors.
- [ ] Security testing in CI (SAST/DAST/SCA) and scheduled pen-tests.
- [ ] Chaos/failover testing for provider outages.
- [ ] Test coverage targets and a regression suite gating releases.

---

## 12. Business, Legal & Operations

- [ ] Corporate structuring (entity per jurisdiction as licensing requires).
- [ ] **Banking & payout partnerships** signed (the hardest commercial dependency).
- [ ] Liquidity / FX provider contracts and pre-funding lines.
- [ ] Pricing model: fee + FX spread, with margin analysis.
- [ ] Treasury & finance operations and reconciliation team.
- [ ] **Compliance & customer-support teams** staffed (real people, not just software).
- [ ] Insurance (cyber, custody, professional indemnity).
- [ ] Vendor risk management for all critical third parties.
- [ ] Analytics/BI stack for product, finance, and compliance reporting.
- [ ] Terms of Service, Privacy Policy, AML policy, and customer agreements drafted by counsel.

---

## 13. Brand & Presentation (sales-ready)

- [ ] Production brand identity, marketing site, and corridor/rate transparency pages.
- [ ] App store listings, ASO, and screenshots.
- [ ] Trust & security page (certifications, licences, data handling).
- [ ] Case studies / testimonials once live.
- [ ] Consistent design system (the existing UI kit — Button/Input/Card/Badge, deep-navy theme — is a strong starting point to formalise).

---

## 14. Suggested phasing

A realistic order of operations (compliance and rails gate everything else):

**Phase 0 — Foundations (now → engineering hardening)**
Postgres + migrations, secrets management, environments, CI/CD, observability, test suite, security baseline. *(Non-blocking on lawyers; start immediately.)*

**Phase 1 — Legal & compliance groundwork**
Engage counsel; choose jurisdictions; begin licensing; select KYC/AML/sanctions vendors; draft policies. **Longest lead time — start in parallel with Phase 0.**

**Phase 2 — Real rails (single corridor)**
One pay-in method, one live FX provider with locked quotes, one payout partner, double-entry ledger, real custody/KMS, reconciliation. Launch **one** licensed corridor in a controlled beta.

**Phase 3 — Trust & scale**
MFA/fraud engine, notifications, recipient management, receipts, support tooling, status page, DR. Pen-test and external audit.

**Phase 4 — Growth**
Additional corridors (each licensed + integrated), mobile apps, localisation, referral program, payout-method expansion (mobile money), analytics maturity.

---

## 15. Top risks to flag to the client

1. **Licensing lead time and cost** dominate the timeline — often months to years and significant capital. This, not engineering, is the critical path.
2. **Custody of funds and keys** is an existential risk — get it wrong and you lose customer money. Budget for a qualified custodian/KMS, not in-house key storage.
3. **Banking/payout partnerships** are a hard commercial dependency, especially for the receiving market.
4. **The crypto/stablecoin layer is a strategic fork**: it can speed settlement but adds VASP licensing, custody, Travel Rule, and depeg risk. Decide early whether to keep it or settle bank-to-bank.
5. **Compliance is ongoing, not one-off** — monitoring, reporting, and audits are permanent operating costs.

---

### Appendix A — Prototype components and their production replacements

| Prototype file / concept | Production replacement |
|---|---|
| `lib/jupiter.ts` (simulated swap) | Real settlement: licensed banking rails and/or audited on-chain execution with a custodian. |
| `lib/solana.ts` (devnet, airdrops) | Mainnet RPC with redundancy + monitoring, or removed if settling bank-to-bank. |
| `lib/fx.ts` (hardcoded rates) | Live FX provider(s) with quote locking, expiry, and spread. |
| `lib/encryption.ts` + key in DB | HSM/KMS/MPC custody; keys never in the app database. |
| `services/walletService.ts` seeded balances | Real funding/ledger; no seeded money. |
| SQLite `prisma/dev.db` | Managed Postgres with backups, replication, migrations. |
| JWT-only auth (`lib/jwt.ts`, `lib/session.ts`) | MFA, refresh-token rotation, session management, step-up auth. |
| Zod 100–500,000 amount check | Risk-based limits tied to KYC tier + AML rules. |
| `.env` secrets | Managed secrets store with rotation. |
| No identity/AML | KYC vendor + full AML/CFT program + sanctions/PEP screening. |
| Fee ¥0 "Prototype" | Real pricing (fee + FX spread) with regulated disclosures. |

---

*Prepared as a planning artifact. Compliance, licensing, and custody items must be validated with qualified legal, regulatory, and financial-services advisors in each operating jurisdiction before handling real customer funds.*
