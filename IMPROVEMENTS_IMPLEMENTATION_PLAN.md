# CRE-Debt-Solana Improvements Implementation Plan

## Overview

This document outlines a structured plan to address all identified issues in the CRE-Debt-Solana codebase. The plan is organized into 6 phases, each focusing on a specific area of improvement. Each phase consists of multiple tasks, with each task representing a single commit for proper traceability.

## Branch Strategy

- **Main Branch**: `main` (production-ready code)
- **Phase Branches**: `phase-X-description` (one branch per phase)
- **PRs**: One PR per phase, merged to main after review

---

## Phase 1: Critical Blocker Fixes

**Branch**: `phase-1-critical-fixes`

**Goal**: Fix MVP-blocking issues preventing the app from running

### Task 1.1: Fix Duplicate Smart Contract Program IDs

- [ ] Change borrower-registry Program ID to unique value
- [ ] Update Anchor.toml with new Program ID
- [ ] Update all references to Program ID in frontend/backend
- [ ] Test that both programs deploy successfully

### Task 1.2: Fix TypeScript Compilation Errors in API

- [ ] Add proper return type annotations to all controller functions (`Promise<void>`)
- [ ] Fix "Not all code paths return a value" errors in:
  - [ ] `api/src/controllers/loans/index.ts`
  - [ ] `api/src/controllers/properties/index.ts`
  - [ ] `api/src/controllers/borrowers/index.ts`
  - [ ] `api/src/controllers/payments/index.ts`
  - [ ] `api/src/controllers/dashboard/index.ts`
  - [ ] `api/src/controllers/platform/index.ts`
- [ ] Run `tsc` to verify clean compilation

### Task 1.3: Fix Database Schema Naming Inconsistencies

- [ ] Audit Prisma schema model names (`users` vs `user`, `properties` vs `property`)
- [ ] Standardize all model names to singular or plural consistently
- [ ] Update all Prisma queries in controllers to match schema
- [ ] Run `prisma generate` and verify client builds
- [ ] Run `prisma db push` to sync schema

### Task 1.4: Fix API Server Startup Issues

- [ ] Add proper async handling in server.ts
- [ ] Fix environment variable loading order
- [ ] Add error handling for database connection
- [ ] Verify server starts without errors on `yarn dev`

### Task 1.5: Verify App Runs Locally

- [ ] Start PostgreSQL via docker-compose
- [ ] Start API server successfully
- [ ] Start Next.js frontend successfully
- [ ] Access localhost:3000 and verify landing page loads
- [ ] Test wallet connection flow

---

## Phase 2: Security Patches

**Branch**: `phase-2-security-patches`

**Goal**: Address all security vulnerabilities identified in the codebase

### Task 2.1: Implement Wallet Signature Verification

- [ ] Create message signing utility for Solana wallets
- [ ] Add `verifyWalletOwnership` middleware
- [ ] Protect sensitive API endpoints (loan creation, property creation)
- [ ] Add signature verification to:
  - [ ] `POST /api/properties`
  - [ ] `POST /api/loans`
  - [ ] `POST /api/payments`
  - [ ] Any write operations
- [ ] Create unit tests for signature verification

### Task 2.2: Fix File Upload Vulnerabilities

- [ ] Add file type validation with allowlist (not just regex)
- [ ] Implement file size limits per file and total request
- [ ] Add file virus scanning integration (ClamAV or similar)
- [ ] Fix path traversal vulnerabilities in file naming
- [ ] Store uploads in secure location with proper permissions
- [ ] Add file metadata logging

### Task 2.3: Fix CORS Configuration

- [ ] Replace hardcoded localhost with environment variable
- [ ] Add proper CORS origin validation
- [ ] Restrict credentials sharing appropriately
- [ ] Document CORS configuration in .env.example

### Task 2.4: Add Authentication Middleware

- [ ] Create JWT authentication middleware
- [ ] Implement wallet-based session management
- [ ] Add route protection for admin-only endpoints:
  - [ ] `POST /api/loans/:id/approve`
  - [ ] `POST /api/loans/:id/reject`
  - [ ] `POST /api/platform/config`
- [ ] Add role-based access control (borrower vs admin)

### Task 2.5: Add Input Validation and Sanitization

- [ ] Implement Zod validation schemas on backend
- [ ] Add request body sanitization
- [ ] Validate all numeric inputs (no negative loans, realistic values)
- [ ] Add SQL injection prevention (Prisma handles most, but audit queries)
- [ ] Add rate limiting per wallet address (not just global)

---

## Phase 3: Missing Features - Pages & API

**Branch**: `phase-3-missing-features`

**Goal**: Implement all missing pages and API endpoints

### Task 3.1: Create /properties Page

- [ ] Create `app/src/app/properties/page.tsx`
- [ ] Implement property listing grid
- [ ] Add search/filter functionality (by city, state, type, status)
- [ ] Add pagination or infinite scroll
- [ ] Connect to `GET /api/properties` endpoint
- [ ] Add loading skeletons
- [ ] Handle empty state

### Task 3.2: Create /properties/[id] Property Detail Page

- [ ] Create `app/src/app/properties/[id]/page.tsx`
- [ ] Display full property details (address, value, type, documents)
- [ ] Show property valuation history
- [ ] Add "Apply for Loan" CTA button
- [ ] Display associated loan applications
- [ ] Connect to `GET /api/properties/:id` endpoint

### Task 3.3: Create /loans/[id] Loan Detail Page

- [ ] Create `app/src/app/loans/[id]/page.tsx`
- [ ] Display loan summary (amount, interest, term, status)
- [ ] Show amortization schedule table
- [ ] Display payment history
- [ ] Add "Make Payment" button if active
- [ ] Connect to `GET /api/loans/:id` endpoint

### Task 3.4: Create /payments Page and Payment Form

- [ ] Create `app/src/app/payments/page.tsx`
- [ ] Implement `PaymentForm` component with full USDC payment flow
- [ ] Connect to `POST /api/payments` endpoint
- [ ] Add wallet signature for payment authorization
- [ ] Show payment confirmation and receipt

### Task 3.5: Add Missing API Endpoints

- [ ] Implement `POST /api/borrowers` - Register new borrower
- [ ] Implement `POST /api/loans/:id/fund` - Fund approved loan
- [ ] Implement `POST /api/loans/:id/approve` - Admin approve endpoint
- [ ] Implement `POST /api/loans/:id/reject` - Admin reject endpoint
- [ ] Implement `GET /api/loans/stats` - Loan statistics
- [ ] Implement `GET /api/properties/stats` - Property statistics

### Task 3.6: Implement Blockchain Integration Layer

- [ ] Create `api/src/services/solana.ts` service
- [ ] Implement connection to Solana RPC endpoint
- [ ] Add functions to:
  - [ ] Initialize platform config on-chain
  - [ ] Create loan on-chain
  - [ ] Approve loan on-chain
  - [ ] Fund loan (USDC transfer)
  - [ ] Process payment (USDC transfer)
  - [ ] Fetch loan/borrower/property accounts from chain
- [ ] Add proper error handling for blockchain operations
- [ ] Add transaction confirmation and logging

---

## Phase 4: Frontend Improvements

**Branch**: `phase-4-frontend-improvements`

**Goal**: Improve user experience, state management, and UI components

### Task 4.1: Implement Global State Management with Zustand

- [ ] Create `app/src/lib/store/userStore.ts`
- [ ] Create `app/src/lib/store/propertyStore.ts`
- [ ] Create `app/src/lib/store/loanStore.ts`
- [ ] Move API data fetching into stores
- [ ] Replace direct API calls in components with store selectors
- [ ] Add persist middleware for offline support
- [ ] Add store loading/error states

### Task 4.2: Add Loading States and Error Boundaries

- [ ] Create `LoadingSpinner` component
- [ ] Create `ErrorBoundary` component with retry option
- [ ] Wrap all pages with error boundaries
- [ ] Add skeleton loaders for:
  - [ ] Property cards
  - [ ] Loan tables
  - [ ] Payment history
  - [ ] Dashboard stats
- [ ] Implement React Suspense for async data

### Task 4.3: Add Toast Notification System

- [ ] Create `ToastProvider` context
- [ ] Create `useToast` hook
- [ ] Implement toast types: success, error, warning, info
- [ ] Add toast to all form submissions
- [ ] Add toast for wallet connection events
- [ ] Add toast for API errors
- [ ] Position toasts appropriately (top-right)

### Task 4.4: Improve Wallet Provider

- [ ] Add error handling for wallet connection failures
- [ ] Add "disconnect wallet" functionality
- [ ] Add wallet address copy button
- [ ] Add network detection (devnet/mainnet)
- [ ] Add fallback UI when no wallet installed
- [ ] Add connection status indicator
- [ ] Support additional wallet adapters (Backpack, Ledger)

### Task 4.5: Add Loan Calculator Visualization

- [ ] Integrate `LoanCalculator` component into loan application
- [ ] Add real-time amortization preview
- [ ] Visualize monthly payment breakdown (principal vs interest)
- [ ] Show total interest paid over loan term
- [ ] Add interactive slider for loan amount/term
- [ ] Display LTV ratio in real-time

### Task 4.6: Responsive Design Improvements

- [ ] Audit mobile responsiveness for all pages
- [ ] Fix navigation on mobile (hamburger menu)
- [ ] Make dashboard responsive (stack cards on mobile)
- [ ] Make forms mobile-friendly
- [ ] Test on various screen sizes
- [ ] Add touch-friendly interactions

### Task 4.7: Add Accessibility Features

- [ ] Add ARIA labels to all interactive elements
- [ ] Ensure keyboard navigation works
- [ ] Add focus indicators
- [ ] Test with screen reader
- [ ] Add skip to main content link
- [ ] Ensure color contrast meets WCAG AA standards

---

## Phase 5: Smart Contract Improvements

**Branch**: `phase-5-smart-contract-improvements`

**Goal**: Enhance smart contracts with proper cross-program calls and amortization

### Task 5.1: Implement Cross-Program Invocations

- [ ] Modify loan-core to properly import Property account type
- [ ] Implement CPI calls to property-registry program
- [ ] Implement CPI calls to borrower-registry program
- [ ] Add proper account validation in instruction contexts
- [ ] Test cross-program interactions
- [ ] Update instruction comments for cross-program flow

### Task 5.2: Add Proper Token PDA Management

- [ ] Create function to derive PDA for borrower's USDC token account
- [ ] Add instruction to create token account if needed
- [ ] Implement proper token account ownership validation
- [ ] Add platform treasury token account management
- [ ] Handle token account close on loan completion

### Task 5.3: Implement Proper Loan Amortization

- [ ] Replace simple interest calculation with proper amortization
- [ ] Calculate monthly payment using standard amortization formula
- [ ] Track accrued interest separately from principal
- [ ] Implement proper payment allocation (interest first, then principal)
- [ ] Add balloon payment support for short-term loans
- [ ] Calculate and display amortization schedule

### Task 5.4: Add Smart Contract Comprehensive Tests

- [ ] Create `programs/loan-core/tests/loan-core.spec.ts`
- [ ] Create `programs/property-registry/tests/property-registry.spec.ts`
- [ ] Create `programs/borrower-registry/tests/borrower-registry.spec.ts`
- [ ] Test all instruction functions
- [ ] Test edge cases (LTV at boundary, max loan amounts)
- [ ] Test error conditions (unauthorized access, invalid states)
- [ ] Achieve 80%+ test coverage
- [ ] Run all tests with `anchor test`

### Task 5.5: Add Event Listeners and Webhook Support

- [ ] Document all emitted events in smart contracts
- [ ] Create webhook handler in API for blockchain events
- [ ] Implement event parsing for:
  - [ ] LoanCreatedEvent
  - [ ] LoanApprovedEvent
  - [ ] LoanFundedEvent
  - [ ] PaymentProcessedEvent
  - [ ] LoanDelinquentEvent
  - [ ] LoanDefaultedEvent
- [ ] Auto-update database on-chain events
- [ ] Add real-time updates via WebSocket (optional)

---

## Phase 6: Infrastructure & Documentation

**Branch**: `phase-6-infrastructure-docs`

**Goal**: Set up production infrastructure and complete documentation

### Task 6.1: Add Docker Configuration

- [ ] Create `Dockerfile` for API
- [ ] Create `Dockerfile` for Frontend
- [ ] Create `docker-compose.yml` for full stack
- [ ] Include PostgreSQL, API, Frontend, and Solana validator
- [ ] Add proper environment variable handling
- [ ] Add volume mounts for data persistence
- [ ] Test full stack startup with Docker

### Task 6.2: Create Production Deployment Guide

- [ ] Document deployment to Railway/Render/Fly.io
- [ ] Document Vercel frontend deployment
- [ ] Document Helius/Alchemy RPC endpoint setup
- [ ] Document Supabase/Neon PostgreSQL setup
- [ ] Document Solana mainnet deployment process
- [ ] Create checklist for production go-live
- [ ] Add security checklist (secrets rotation, etc.)

### Task 6.3: Set Up CI/CD Pipeline

- [ ] Create `.github/workflows/ci.yml`
- [ ] Add linting step (ESLint, TypeScript)
- [ ] Add frontend build step
- [ ] Add backend build step
- [ ] Add test execution
- [ ] Add container build (if using Docker)
- [ ] Create `.github/workflows/cd.yml` for deployment
- [ ] Add automated security scanning

### Task 6.4: Create Database Seeding Script

- [ ] Create `api/prisma/seed.ts`
- [ ] Add seed data for:
  - [ ] Sample users (with wallet addresses)
  - [ ] Sample properties (various types, values)
  - [ ] Sample loan applications (various statuses)
  - [ ] Sample loans (active, completed, defaulted)
  - [ ] Sample payments
- [ ] Make seed script idempotent (can run multiple times safely)
- [ ] Document how to run seed

### Task 6.5: Add Monitoring and Logging

- [ ] Integrate structured logging with Winston
- [ ] Add request ID tracking for debugging
- [ ] Create health check endpoint with system metrics
- [ ] Add error tracking integration (Sentry or similar)
- [ ] Add Prometheus metrics endpoint
- [ ] Document log retention and monitoring setup

### Task 6.6: Complete API Documentation

- [ ] Add detailed descriptions to all Swagger endpoints
- [ ] Document request/response schemas
- [ ] Add example requests and responses
- [ ] Document error codes and meanings
- [ ] Add authentication requirements per endpoint
- [ ] Test Swagger UI functionality

### Task 6.7: Create Architecture Documentation

- [ ] Create system architecture diagram (Mermaid.js)
- [ ] Document data flow between components
- [ ] Document smart contract architecture
- [ ] Document database schema with ERD
- [ ] Document deployment architecture
- [ ] Add to `docs/` directory

### Task 6.8: Create User Guides

- [ ] Create `docs/user-guides/borrower.md`
- [ ] Create `docs/user-guides/admin.md`
- [ ] Create `docs/user-guides/lender.md`
- [ ] Document step-by-step workflows
- [ ] Add screenshots where helpful
- [ ] Include FAQ section

---

## Progress Tracking

### Phase 1: Critical Blocker Fixes
- [x] Task 1.1: Fix Duplicate Smart Contract Program IDs
- [x] Task 1.2: Fix TypeScript Compilation Errors in API
- [x] Task 1.3: Fix Database Schema Naming Inconsistencies
- [x] Task 1.4: Fix API Server Startup Issues
- [x] Task 1.5: Verify App Runs Locally

### Phase 2: Security Patches
- [ ] Task 2.1: Implement Wallet Signature Verification
- [ ] Task 2.2: Fix File Upload Vulnerabilities
- [ ] Task 2.3: Fix CORS Configuration
- [ ] Task 2.4: Add Authentication Middleware
- [ ] Task 2.5: Add Input Validation and Sanitization

### Phase 3: Missing Features - Pages & API
- [ ] Task 3.1: Create /properties Page
- [ ] Task 3.2: Create /properties/[id] Property Detail Page
- [ ] Task 3.3: Create /loans/[id] Loan Detail Page
- [ ] Task 3.4: Create /payments Page and Payment Form
- [ ] Task 3.5: Add Missing API Endpoints
- [ ] Task 3.6: Implement Blockchain Integration Layer

### Phase 4: Frontend Improvements
- [ ] Task 4.1: Implement Global State Management with Zustand
- [ ] Task 4.2: Add Loading States and Error Boundaries
- [ ] Task 4.3: Add Toast Notification System
- [ ] Task 4.4: Improve Wallet Provider
- [ ] Task 4.5: Add Loan Calculator Visualization
- [ ] Task 4.6: Responsive Design Improvements
- [ ] Task 4.7: Add Accessibility Features

### Phase 5: Smart Contract Improvements
- [ ] Task 5.1: Implement Cross-Program Invocations
- [ ] Task 5.2: Add Proper Token PDA Management
- [ ] Task 5.3: Implement Proper Loan Amortization
- [ ] Task 5.4: Add Smart Contract Comprehensive Tests
- [ ] Task 5.5: Add Event Listeners and Webhook Support

### Phase 6: Infrastructure & Documentation
- [ ] Task 6.1: Add Docker Configuration
- [ ] Task 6.2: Create Production Deployment Guide
- [ ] Task 6.3: Set Up CI/CD Pipeline
- [ ] Task 6.4: Create Database Seeding Script
- [ ] Task 6.5: Add Monitoring and Logging
- [ ] Task 6.6: Complete API Documentation
- [ ] Task 6.7: Create Architecture Documentation
- [ ] Task 6.8: Create User Guides

---

## Summary

| Phase | Tasks | Estimated Commits |
|-------|-------|-------------------|
| Phase 1: Critical Blocker Fixes | 5 | 5-7 |
| Phase 2: Security Patches | 5 | 6-8 |
| Phase 3: Missing Features | 6 | 8-10 |
| Phase 4: Frontend Improvements | 7 | 7-9 |
| Phase 5: Smart Contract Improvements | 5 | 6-8 |
| Phase 6: Infrastructure & Documentation | 8 | 8-10 |
| **Total** | **36** | **40-52** |

---

## Getting Started

To begin working on this plan:

```bash
# Clone the repository
git clone https://github.com/yourusername/cre-debt-solana.git
cd cre-debt-solana

# Start with Phase 1
git checkout -b phase-1-critical-fixes
# Work on tasks, committing as you go
# When phase is complete, push and create PR
```

---

*Last Updated: January 2026*
*Version: 1.0.0*
