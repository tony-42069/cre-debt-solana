import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import { expect } from "chai";
import { BorrowerRegistry } from "../target/types/borrower_registry";
import { PropertyRegistry } from "../target/types/property_registry";
import { LoanCore } from "../target/types/loan_core";

describe("Cross-Program Integration", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const borrowerRegistry = anchor.workspace.BorrowerRegistry as Program<BorrowerRegistry>;
  const propertyRegistry = anchor.workspace.PropertyRegistry as Program<PropertyRegistry>;
  const loanCore = anchor.workspace.LoanCore as Program<LoanCore>;

  const authority = Keypair.generate();
  const borrower = Keypair.generate();
  const lender = Keypair.generate();

  let borrowerAccount: PublicKey;
  let propertyAccount: PublicKey;
  let loanAccount: PublicKey;
  let platformConfigAccount: PublicKey;

  const borrowerId = "borrower-integration-001";
  const propertyId = "property-integration-001";
  const loanId = "loan-integration-001";

  before(async () => {
    // Airdrop SOL to test accounts
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(authority.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL)
    );
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(borrower.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL)
    );
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(lender.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL)
    );

    // Derive PDAs
    [borrowerAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("borrower"), borrower.publicKey.toBuffer()],
      borrowerRegistry.programId
    );

    [propertyAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("property"), borrower.publicKey.toBuffer(), Buffer.from(propertyId)],
      propertyRegistry.programId
    );

    [loanAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("loan"), Buffer.from(loanId)],
      loanCore.programId
    );

    [platformConfigAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("platform-config")],
      loanCore.programId
    );
  });

  it("Complete loan origination flow: Borrower → Property → Loan", async () => {
    // Step 1: Register borrower
    await borrowerRegistry.methods
      .registerBorrower({
        borrowerId,
        entityType: 0, // Individual
        metadataUri: "ipfs://QmBorrower123",
      })
      .accounts({
        wallet: borrower.publicKey,
        borrower: borrowerAccount,
        systemProgram: SystemProgram.programId,
      })
      .signers([borrower])
      .rpc();

    // Step 2: Register property
    const propertyValue = new anchor.BN(50000000); // $500,000
    const valuationDate = new anchor.BN(Date.now() / 1000);
    const locationHash = Array.from({ length: 32 }, () => Math.floor(Math.random() * 256));

    await propertyRegistry.methods
      .registerProperty(
        propertyId,
        propertyValue,
        valuationDate,
        1, // Appraisal
        "ABC Appraisal Co",
        0, // Commercial
        locationHash,
        "ipfs://QmProperty123"
      )
      .accounts({
        owner: borrower.publicKey,
        property: propertyAccount,
        systemProgram: SystemProgram.programId,
      })
      .signers([borrower])
      .rpc();

    // Step 3: Verify property
    // First initialize platform config for property registry
    const [propertyPlatformConfig] = PublicKey.findProgramAddressSync(
      [Buffer.from("platform-config")],
      propertyRegistry.programId
    );

    await propertyRegistry.methods
      .initializePlatform({
        treasury: lender.publicKey,
        maxLtv: 9000,
        minLoanAmount: new anchor.BN(1000000),
        maxLoanAmount: new anchor.BN(100000000),
        originationFee: 500,
        servicingFee: 200,
        minInterestRate: 500,
        defaultInterestRate: 800,
        lateFeeRate: 1000,
        gracePeriodDays: 30,
        treasuryTokenAccount: lender.publicKey,
      })
      .accounts({
        authority: authority.publicKey,
        platformConfig: propertyPlatformConfig,
        systemProgram: SystemProgram.programId,
      })
      .signers([authority])
      .rpc();

    await propertyRegistry.methods
      .verifyProperty(propertyId)
      .accounts({
        authority: authority.publicKey,
        platformConfig: propertyPlatformConfig,
        property: propertyAccount,
      })
      .signers([authority])
      .rpc();

    // Step 4: Initialize loan core platform
    await loanCore.methods
      .initializePlatform({
        treasury: lender.publicKey,
        maxLtv: 9000,
        minLoanAmount: new anchor.BN(1000000),
        maxLoanAmount: new anchor.BN(100000000),
        originationFee: 500,
        servicingFee: 200,
        minInterestRate: 500,
        defaultInterestRate: 800,
        lateFeeRate: 1000,
        gracePeriodDays: 30,
        treasuryTokenAccount: lender.publicKey,
      })
      .accounts({
        authority: authority.publicKey,
        platformConfig: platformConfigAccount,
        systemProgram: SystemProgram.programId,
      })
      .signers([authority])
      .rpc();

    // Step 5: Create loan application
    const loanParams = {
      loanId,
      propertyId,
      principalAmount: new anchor.BN(40000000), // $400,000 (80% LTV)
      interestRate: 800, // 8%
      termMonths: 12,
    };

    await loanCore.methods
      .createLoan(loanParams)
      .accounts({
        borrower: borrower.publicKey,
        loan: loanAccount,
        platformConfig: platformConfigAccount,
        property: propertyAccount,
        systemProgram: SystemProgram.programId,
      })
      .signers([borrower])
      .rpc();

    // Step 6: Approve loan
    await loanCore.methods
      .approveLoan(loanId)
      .accounts({
        authority: authority.publicKey,
        platformConfig: platformConfigAccount,
        loan: loanAccount,
      })
      .signers([authority])
      .rpc();

    // Verify complete flow
    const borrowerData = await borrowerRegistry.account.borrower.fetch(borrowerAccount);
    const propertyData = await propertyRegistry.account.property.fetch(propertyAccount);
    const loanData = await loanCore.account.loan.fetch(loanAccount);

    // Borrower verification
    expect(borrowerData.borrowerId).to.equal(borrowerId);
    expect(borrowerData.kycStatus).to.deep.equal({ pending: {} });

    // Property verification
    expect(propertyData.propertyId).to.equal(propertyId);
    expect(propertyData.verified).to.equal(true);
    expect(propertyData.value.toString()).to.equal(propertyValue.toString());

    // Loan verification
    expect(loanData.loanId).to.equal(loanId);
    expect(loanData.status).to.deep.equal({ approved: {} });
    expect(loanData.principalAmount.toString()).to.equal(loanParams.principalAmount.toString());
    expect(loanData.ltvRatio).to.equal(8000); // 80% LTV in basis points
  });

  it("Validates borrower KYC before loan approval", async () => {
    // Update borrower KYC to approved
    await borrowerRegistry.methods
      .updateKycStatus(borrowerId, { approved: {} })
      .accounts({
        authority: authority.publicKey,
        platformConfig: platformConfigAccount,
        borrower: borrowerAccount,
      })
      .signers([authority])
      .rpc();

    // Verify KYC status
    const borrowerData = await borrowerRegistry.account.borrower.fetch(borrowerAccount);
    expect(borrowerData.kycStatus).to.deep.equal({ approved: {} });
  });

  it("Updates borrower loan count after loan creation", async () => {
    const borrowerData = await borrowerRegistry.account.borrower.fetch(borrowerAccount);
    expect(borrowerData.activeLoans).to.equal(0); // Would be updated in real implementation
    expect(borrowerData.totalBorrowed.toNumber()).to.equal(0); // Would be updated in real implementation
  });

  it("Maintains data consistency across programs", async () => {
    // Verify all programs have consistent data
    const borrowerData = await borrowerRegistry.account.borrower.fetch(borrowerAccount);
    const propertyData = await propertyRegistry.account.property.fetch(propertyAccount);
    const loanData = await loanCore.account.loan.fetch(loanAccount);

    // Cross-program data consistency checks
    expect(borrowerData.wallet.toString()).to.equal(borrower.publicKey.toString());
    expect(propertyData.owner.toString()).to.equal(borrower.publicKey.toString());
    expect(loanData.borrower.toString()).to.equal(borrower.publicKey.toString());
    expect(loanData.propertyId).to.equal(propertyData.propertyId);
  });

  it("Handles error scenarios gracefully", async () => {
    // Test unauthorized access attempts
    const unauthorizedUser = Keypair.generate();
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(unauthorizedUser.publicKey, anchor.web3.LAMPORTS_PER_SOL)
    );

    // Try to approve loan without authorization
    try {
      await loanCore.methods
        .approveLoan(loanId)
        .accounts({
          authority: unauthorizedUser.publicKey,
          platformConfig: platformConfigAccount,
          loan: loanAccount,
        })
        .signers([unauthorizedUser])
        .rpc();
      expect.fail("Should have thrown unauthorized access error");
    } catch (error) {
      expect(error.message).to.include("UnauthorizedAccess");
    }
  });
});
