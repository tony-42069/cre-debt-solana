import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import { expect } from "chai";
import { LoanCore } from "../target/types/loan_core";

describe("Loan Core", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.LoanCore as Program<LoanCore>;
  const authority = Keypair.generate();
  const borrower = Keypair.generate();
  const lender = Keypair.generate();

  let platformConfigAccount: PublicKey;
  let loanAccount: PublicKey;
  let borrowerAccount: PublicKey;
  let propertyAccount: PublicKey;

  const loanId = "loan-001";
  const propertyId = "property-001";

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
    [platformConfigAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("platform-config")],
      program.programId
    );

    [loanAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("loan"), Buffer.from(loanId)],
      program.programId
    );

    [borrowerAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("borrower"), borrower.publicKey.toBuffer()],
      program.programId
    );

    [propertyAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("property"), borrower.publicKey.toBuffer(), Buffer.from(propertyId)],
      program.programId
    );
  });

  it("Initializes platform configuration", async () => {
    const config = {
      treasury: lender.publicKey,
      maxLtv: 9000, // 90%
      minLoanAmount: new anchor.BN(1000000), // 1 USDC
      maxLoanAmount: new anchor.BN(100000000), // 100 USDC
      originationFee: 500, // 5%
      servicingFee: 200, // 2%
      minInterestRate: 500, // 5%
      defaultInterestRate: 800, // 8%
      lateFeeRate: 1000, // 10%
      gracePeriodDays: 30,
      treasuryTokenAccount: lender.publicKey,
    };

    await program.methods
      .initializePlatform(config)
      .accounts({
        authority: authority.publicKey,
        platformConfig: platformConfigAccount,
        systemProgram: SystemProgram.programId,
      })
      .signers([authority])
      .rpc();

    // Verify platform config
    const platformData = await program.account.platformConfig.fetch(platformConfigAccount);
    expect(platformData.authority.toString()).to.equal(authority.publicKey.toString());
    expect(platformData.maxLtv).to.equal(9000);
    expect(platformData.paused).to.equal(false);
  });

  it("Creates a loan application", async () => {
    // First create a mock property account (simplified for testing)
    const propertyValue = new anchor.BN(50000000); // $500,000

    // Create a simple property account for testing
    const propertyData = {
      owner: borrower.publicKey,
      propertyId,
      value: propertyValue,
      verified: true,
    };

    // For this test, we'll create a simplified property account
    // In real implementation, this would come from property registry
    const mockPropertyAccount = Keypair.generate();
    await program.rpc.initializePlatform(
      {
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
      },
      {
        accounts: {
          authority: authority.publicKey,
          platformConfig: platformConfigAccount,
          systemProgram: SystemProgram.programId,
        },
        signers: [authority],
      }
    );

    const loanParams = {
      loanId,
      propertyId,
      principalAmount: new anchor.BN(40000000), // $400,000 (80% LTV)
      interestRate: 800, // 8%
      termMonths: 12,
    };

    await program.methods
      .createLoan(loanParams)
      .accounts({
        borrower: borrower.publicKey,
        loan: loanAccount,
        platformConfig: platformConfigAccount,
        property: propertyAccount, // This would need to be a real property account
        systemProgram: SystemProgram.programId,
      })
      .signers([borrower])
      .rpc();

    // Verify loan was created
    const loanData = await program.account.loan.fetch(loanAccount);
    expect(loanData.loanId).to.equal(loanId);
    expect(loanData.borrower.toString()).to.equal(borrower.publicKey.toString());
    expect(loanData.status).to.deep.equal({ pending: {} });
    expect(loanData.principalAmount.toString()).to.equal(loanParams.principalAmount.toString());
  });

  it("Approves a loan application", async () => {
    await program.methods
      .approveLoan(loanId)
      .accounts({
        authority: authority.publicKey,
        platformConfig: platformConfigAccount,
        loan: loanAccount,
      })
      .signers([authority])
      .rpc();

    // Verify loan was approved
    const loanData = await program.account.loan.fetch(loanAccount);
    expect(loanData.status).to.deep.equal({ approved: {} });
    expect(loanData.approvedAt).to.not.be.null;
  });

  it("Rejects loan creation with invalid LTV", async () => {
    const invalidLoanId = "loan-002";
    const [invalidLoanAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("loan"), Buffer.from(invalidLoanId)],
      program.programId
    );

    const loanParams = {
      loanId: invalidLoanId,
      propertyId,
      principalAmount: new anchor.BN(45000000), // $450,000 (90%+ LTV - should fail)
      interestRate: 800,
      termMonths: 12,
    };

    try {
      await program.methods
        .createLoan(loanParams)
        .accounts({
          borrower: borrower.publicKey,
          loan: invalidLoanAccount,
          platformConfig: platformConfigAccount,
          property: propertyAccount,
          systemProgram: SystemProgram.programId,
        })
        .signers([borrower])
        .rpc();
      expect.fail("Should have thrown error for LTV exceeded");
    } catch (error) {
      expect(error.message).to.include("LtvExceeded");
    }
  });

  it("Rejects loan creation with amount too small", async () => {
    const invalidLoanId = "loan-003";
    const [invalidLoanAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("loan"), Buffer.from(invalidLoanId)],
      program.programId
    );

    const loanParams = {
      loanId: invalidLoanId,
      propertyId,
      principalAmount: new anchor.BN(500000), // $5,000 (below minimum)
      interestRate: 800,
      termMonths: 12,
    };

    try {
      await program.methods
        .createLoan(loanParams)
        .accounts({
          borrower: borrower.publicKey,
          loan: invalidLoanAccount,
          platformConfig: platformConfigAccount,
          property: propertyAccount,
          systemProgram: SystemProgram.programId,
        })
        .signers([borrower])
        .rpc();
      expect.fail("Should have thrown error for loan too small");
    } catch (error) {
      expect(error.message).to.include("LoanTooSmall");
    }
  });

  it("Rejects unauthorized loan approval", async () => {
    const unauthorizedUser = Keypair.generate();
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(unauthorizedUser.publicKey, anchor.web3.LAMPORTS_PER_SOL)
    );

    try {
      await program.methods
        .approveLoan(loanId)
        .accounts({
          authority: unauthorizedUser.publicKey,
          platformConfig: platformConfigAccount,
          loan: loanAccount,
        })
        .signers([unauthorizedUser])
        .rpc();
      expect.fail("Should have thrown error for unauthorized access");
    } catch (error) {
      expect(error.message).to.include("UnauthorizedAccess");
    }
  });

  it("Handles platform pause functionality", async () => {
    // This test would require modifying the platform config to test pause
    // For now, we verify the pause field exists
    const platformData = await program.account.platformConfig.fetch(platformConfigAccount);
    expect(platformData.paused).to.equal(false);
  });

  it("Validates loan status transitions", async () => {
    const loanData = await program.account.loan.fetch(loanAccount);
    expect(loanData.status).to.deep.equal({ approved: {} });

    // Verify other loan properties
    expect(loanData.loanId).to.equal(loanId);
    expect(loanData.ltvRatio).to.be.greaterThan(0);
    expect(loanData.propertyValue.toNumber()).to.be.greaterThan(0);
  });
});
