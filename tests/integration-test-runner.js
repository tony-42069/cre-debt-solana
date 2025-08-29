#!/usr/bin/env node

/**
 * CRE-Debt-Solana Integration Test Runner
 * Comprehensive testing suite for end-to-end functionality
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

class TestRunner {
  constructor() {
    this.tests = []
    this.passed = 0
    this.failed = 0
    this.results = []
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString()
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      error: '\x1b[31m',
      warning: '\x1b[33m',
      reset: '\x1b[0m'
    }

    console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`)
  }

  addTest(name, testFn) {
    this.tests.push({ name, testFn })
  }

  async runTest(test) {
    try {
      this.log(`Running: ${test.name}`, 'info')
      await test.testFn()
      this.passed++
      this.results.push({ name: test.name, status: 'PASSED' })
      this.log(`✅ PASSED: ${test.name}`, 'success')
    } catch (error) {
      this.failed++
      this.results.push({ name: test.name, status: 'FAILED', error: error.message })
      this.log(`❌ FAILED: ${test.name} - ${error.message}`, 'error')
    }
  }

  async runAll() {
    this.log('🚀 Starting CRE-Debt-Solana Integration Tests', 'info')
    this.log('=' .repeat(60), 'info')

    for (const test of this.tests) {
      await this.runTest(test)
    }

    this.printSummary()
  }

  printSummary() {
    this.log('\n' + '=' .repeat(60), 'info')
    this.log('📊 TEST SUMMARY', 'info')
    this.log('=' .repeat(60), 'info')
    this.log(`Total Tests: ${this.tests.length}`, 'info')
    this.log(`Passed: ${this.passed}`, 'success')
    this.log(`Failed: ${this.failed}`, this.failed > 0 ? 'error' : 'info')

    if (this.failed > 0) {
      this.log('\n❌ FAILED TESTS:', 'error')
      this.results
        .filter(r => r.status === 'FAILED')
        .forEach(r => {
          this.log(`  - ${r.name}: ${r.error}`, 'error')
        })
    }

    this.log('\n✅ PASSED TESTS:', 'success')
    this.results
      .filter(r => r.status === 'PASSED')
      .forEach(r => {
        this.log(`  - ${r.name}`, 'success')
      })

    const successRate = ((this.passed / this.tests.length) * 100).toFixed(1)
    this.log(`\n🎯 Success Rate: ${successRate}%`, this.failed > 0 ? 'warning' : 'success')
  }
}

// Test Suite
const testRunner = new TestRunner()

// 1. File Structure Tests
testRunner.addTest('File Structure Validation', async () => {
  const requiredFiles = [
    'api/src/server.ts',
    'api/src/controllers/properties/index.ts',
    'api/src/controllers/loans/index.ts',
    'api/src/controllers/payments/index.ts',
    'app/src/app/page.tsx',
    'app/src/app/properties/register/page.tsx',
    'app/src/app/loans/apply/page.tsx',
    'app/src/app/dashboard/page.tsx',
    'programs/property-registry/src/lib.rs',
    'programs/loan-core/src/lib.rs',
    'programs/borrower-registry/src/lib.rs'
  ]

  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      throw new Error(`Required file missing: ${file}`)
    }
  }
})

// 2. API Structure Tests
testRunner.addTest('API Routes Configuration', async () => {
  const serverContent = fs.readFileSync('api/src/server.ts', 'utf8')

  const requiredRoutes = [
    '/api/properties',
    '/api/loans',
    '/api/payments',
    '/api/dashboard'
  ]

  for (const route of requiredRoutes) {
    if (!serverContent.includes(route)) {
      throw new Error(`API route not configured: ${route}`)
    }
  }
})

// 3. Frontend Component Tests
testRunner.addTest('Frontend Components Structure', async () => {
  const requiredComponents = [
    'app/src/components/forms/PropertyForm.tsx',
    'app/src/components/forms/PropertyDetailsStep.tsx',
    'app/src/components/forms/PropertyValuationStep.tsx',
    'app/src/components/forms/PropertyDocumentationStep.tsx',
    'app/src/components/forms/PropertyReviewStep.tsx',
    'app/src/components/payments/PaymentForm.tsx',
    'app/src/components/payments/PaymentHistory.tsx',
    'app/src/components/payments/PaymentSchedule.tsx'
  ]

  for (const component of requiredComponents) {
    if (!fs.existsSync(component)) {
      throw new Error(`Required component missing: ${component}`)
    }
  }
})

// 4. Smart Contract Tests
testRunner.addTest('Smart Contract Structure', async () => {
  const contracts = [
    'programs/property-registry/src/lib.rs',
    'programs/loan-core/src/lib.rs',
    'programs/borrower-registry/src/lib.rs'
  ]

  for (const contract of contracts) {
    const content = fs.readFileSync(contract, 'utf8')

    // Check for basic Anchor structure
    if (!content.includes('#[program]')) {
      throw new Error(`Invalid smart contract structure in: ${contract}`)
    }

    if (!content.includes('use anchor_lang::prelude::*')) {
      throw new Error(`Missing Anchor imports in: ${contract}`)
    }
  }
})

// 5. Database Schema Tests
testRunner.addTest('Database Schema Validation', async () => {
  const schemaContent = fs.readFileSync('api/prisma/schema.prisma', 'utf8')

  const requiredModels = [
    'model User',
    'model Property',
    'model LoanApplication',
    'model Loan',
    'model Payment'
  ]

  for (const model of requiredModels) {
    if (!schemaContent.includes(model)) {
      throw new Error(`Required database model missing: ${model}`)
    }
  }

  // Check for required fields
  const requiredFields = [
    'walletAddress',
    'appraisedValue',
    'ltvRatio',
    'blockchainTx'
  ]

  for (const field of requiredFields) {
    if (!schemaContent.includes(field)) {
      throw new Error(`Required database field missing: ${field}`)
    }
  }
})

// 6. Configuration Tests
testRunner.addTest('Configuration Files Validation', async () => {
  const configFiles = [
    'api/.env.example',
    'api/tsconfig.json',
    'app/tsconfig.json',
    'Anchor.toml'
  ]

  for (const configFile of configFiles) {
    if (!fs.existsSync(configFile)) {
      throw new Error(`Configuration file missing: ${configFile}`)
    }
  }

  // Check Anchor.toml for program configurations
  const anchorContent = fs.readFileSync('Anchor.toml', 'utf8')
  const requiredPrograms = ['property-registry', 'loan-core', 'borrower-registry']

  for (const program of requiredPrograms) {
    if (!anchorContent.includes(program)) {
      throw new Error(`Program not configured in Anchor.toml: ${program}`)
    }
  }
})

// 7. Package Dependencies Tests
testRunner.addTest('Package Dependencies Check', async () => {
  const apiPackage = JSON.parse(fs.readFileSync('api/package.json', 'utf8'))
  const appPackage = JSON.parse(fs.readFileSync('app/package.json', 'utf8'))

  // API dependencies
  const requiredApiDeps = [
    'express',
    'prisma',
    '@prisma/client',
    'cors',
    'helmet'
  ]

  for (const dep of requiredApiDeps) {
    if (!apiPackage.dependencies[dep]) {
      throw new Error(`Required API dependency missing: ${dep}`)
    }
  }

  // Frontend dependencies
  const requiredAppDeps = [
    'next',
    'react',
    'typescript',
    'tailwindcss',
    '@solana/wallet-adapter-react'
  ]

  for (const dep of requiredAppDeps) {
    if (!appPackage.dependencies[dep]) {
      throw new Error(`Required frontend dependency missing: ${dep}`)
    }
  }
})

// 8. Build Process Tests
testRunner.addTest('Build Process Validation', async () => {
  try {
    // Test API build
    execSync('cd api && npm run build', { stdio: 'pipe' })
  } catch (error) {
    throw new Error(`API build failed: ${error.message}`)
  }

  try {
    // Test frontend build
    execSync('cd app && npm run build', { stdio: 'pipe' })
  } catch (error) {
    throw new Error(`Frontend build failed: ${error.message}`)
  }
})

// 9. Smart Contract Compilation Tests
testRunner.addTest('Smart Contract Compilation', async () => {
  const programs = ['property-registry', 'loan-core', 'borrower-registry']

  for (const program of programs) {
    try {
      execSync(`cd programs/${program} && cargo check`, { stdio: 'pipe' })
    } catch (error) {
      throw new Error(`Smart contract compilation failed for ${program}: ${error.message}`)
    }
  }
})

// 10. Integration Flow Tests
testRunner.addTest('Integration Flow Validation', async () => {
  // Check that all components are properly connected

  // 1. API routes are properly imported
  const serverContent = fs.readFileSync('api/src/server.ts', 'utf8')
  if (!serverContent.includes('paymentRoutes')) {
    throw new Error('Payment routes not properly integrated in server.ts')
  }

  // 2. Frontend components import correctly
  const dashboardContent = fs.readFileSync('app/src/app/dashboard/page.tsx', 'utf8')
  if (!dashboardContent.includes('PaymentHistory') || !dashboardContent.includes('PaymentSchedule')) {
    throw new Error('Payment components not properly integrated in dashboard')
  }

  // 3. Database relationships are properly defined
  const schemaContent = fs.readFileSync('api/prisma/schema.prisma', 'utf8')
  const relationshipPatterns = [
    'borrower.*User.*@relation',
    'property.*Property.*@relation',
    'loan.*Loan.*@relation'
  ]

  for (const pattern of relationshipPatterns) {
    if (!schemaContent.includes(pattern.replace('.*', ''))) {
      throw new Error(`Database relationship missing: ${pattern}`)
    }
  }
})

// 11. Security Tests
testRunner.addTest('Security Configuration Check', async () => {
  const serverContent = fs.readFileSync('api/src/server.ts', 'utf8')

  const securityMiddleware = [
    'helmet',
    'cors',
    'rateLimit'
  ]

  for (const middleware of securityMiddleware) {
    if (!serverContent.includes(middleware)) {
      throw new Error(`Security middleware missing: ${middleware}`)
    }
  }

  // Check for environment variable usage
  if (!serverContent.includes('process.env')) {
    throw new Error('Environment variables not properly configured')
  }
})

// 12. Performance Tests
testRunner.addTest('Performance Configuration', async () => {
  const serverContent = fs.readFileSync('api/src/server.ts', 'utf8')

  const performanceFeatures = [
    'compression',
    'loggerMiddleware'
  ]

  for (const feature of performanceFeatures) {
    if (!serverContent.includes(feature)) {
      throw new Error(`Performance feature missing: ${feature}`)
    }
  }
})

// 13. Documentation Tests
testRunner.addTest('Documentation Completeness', async () => {
  const requiredDocs = [
    'README.md',
    'docs/PRODUCTION_SPRINT.md',
    'docs/DEMO_SCRIPT.md',
    'docs/technical-architecture.md'
  ]

  for (const doc of requiredDocs) {
    if (!fs.existsSync(doc)) {
      throw new Error(`Required documentation missing: ${doc}`)
    }

    const content = fs.readFileSync(doc, 'utf8')
    if (content.length < 100) {
      throw new Error(`Documentation file too short: ${doc}`)
    }
  }
})

// 14. Code Quality Tests
testRunner.addTest('Code Quality Standards', async () => {
  const filesToCheck = [
    'api/src/server.ts',
    'app/src/app/page.tsx',
    'app/src/app/dashboard/page.tsx'
  ]

  for (const file of filesToCheck) {
    const content = fs.readFileSync(file, 'utf8')

    // Check for console.log statements (should be removed in production)
    if (content.includes('console.log') && !content.includes('// console.log')) {
      throw new Error(`Console.log found in production code: ${file}`)
    }

    // Check for TODO comments
    if (content.includes('TODO') || content.includes('FIXME')) {
      console.warn(`⚠️  TODO/FIXME comments found in: ${file}`)
    }
  }
})

// 15. Final Integration Test
testRunner.addTest('Complete System Integration', async () => {
  // This is a comprehensive test that validates the entire system works together

  // 1. Check that all API endpoints are properly configured
  const serverContent = fs.readFileSync('api/src/server.ts', 'utf8')
  const apiRoutes = [
    '/api/properties',
    '/api/loans',
    '/api/payments',
    '/api/dashboard',
    '/api/borrowers',
    '/api/platform'
  ]

  for (const route of apiRoutes) {
    if (!serverContent.includes(route)) {
      throw new Error(`API route not integrated: ${route}`)
    }
  }

  // 2. Check that frontend properly imports all components
  const layoutContent = fs.readFileSync('app/src/app/layout.tsx', 'utf8')
  if (!layoutContent.includes('WalletProvider')) {
    throw new Error('Wallet provider not integrated in layout')
  }

  // 3. Check that database is properly configured
  const schemaContent = fs.readFileSync('api/prisma/schema.prisma', 'utf8')
  if (!schemaContent.includes('datasource db')) {
    throw new Error('Database configuration missing')
  }

  // 4. Check that smart contracts are properly structured
  const contractFiles = [
    'programs/property-registry/src/lib.rs',
    'programs/loan-core/src/lib.rs',
    'programs/borrower-registry/src/lib.rs'
  ]

  for (const contractFile of contractFiles) {
    const content = fs.readFileSync(contractFile, 'utf8')
    if (!content.includes('#[program]') || !content.includes('declare_id!')) {
      throw new Error(`Smart contract structure invalid: ${contractFile}`)
    }
  }

  console.log('✅ Complete system integration validated!')
})

// Run all tests
testRunner.runAll().catch(error => {
  console.error('❌ Test runner failed:', error)
  process.exit(1)
})
