import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import { expect } from "chai";
import { BorrowerRegistry } from "../target/types/borrower_registry";

describe("Borrower Registry", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.BorrowerRegistry as Program<BorrowerRegistry>;
  const authority = Keypair.generate();
  const borrower = Keypair.generate();

  let borrowerAccount: PublicKey;
  let platformConfigAccount: PublicKey;

  before(async () => {
    // Airdrop SOL to test accounts
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(authority.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL)
    );
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(borrower.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL)
    );

    // Derive PDAs
    [borrowerAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("borrower"), borrower.publicKey.toBuffer()],
      program.programId
    );

    [platformConfigAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("platform-config")],
      program.programId
    );
  });

  it("Registers a new borrower", async () => {
    const borrowerId = "borrower-001";
    const entityType = 0; // Individual
    const metadataUri = "ipfs://QmTest123";

    const tx = await program.methods
      .registerBorrower({
        borrowerId,
        entityType,
        metadataUri,
      })
      .accounts({
        wallet: borrower.publicKey,
        borrower: borrowerAccount,
        systemProgram: SystemProgram.programId,
      })
      .signers([borrower])
      .rpc();

    // Verify borrower account was created
    const borrowerData = await program.account.borrower.fetch(borrowerAccount);
    expect(borrowerData.wallet.toString()).to.equal(borrower.publicKey.toString());
    expect(borrowerData.borrowerId).to.equal(borrowerId);
    expect(borrowerData.entityType).to.equal(entityType);
    expect(borrowerData.kycStatus).to.deep.equal({ pending: {} });
    expect(borrowerData.activeLoans).to.equal(0);
    expect(borrowerData.totalBorrowed.toNumber()).to.equal(0);
    expect(borrowerData.riskScore).to.equal(500);
  });

  it("Updates borrower KYC status", async () => {
    // First create platform config for authority
    await program.methods
      .initializePlatform({
        treasury: authority.publicKey,
        maxLtv: 9000, // 90%
        minLoanAmount: new anchor.BN(1000000), // 1 USDC
        maxLoanAmount: new anchor.BN(100000000), // 100 USDC
        originationFee: 500, // 5%
        servicingFee: 200, // 2%
        minInterestRate: 500, // 5%
        defaultInterestRate: 800, // 8%
        lateFeeRate: 1000, // 10%
        gracePeriodDays: 30,
        treasuryTokenAccount: authority.publicKey,
      })
      .accounts({
        authority: authority.publicKey,
        platformConfig: platformConfigAccount,
        systemProgram: SystemProgram.programId,
      })
      .signers([authority])
      .rpc();

    // Update KYC status to approved
    const borrowerId = "borrower-001";
    const newKycStatus = { approved: {} };

    await program.methods
      .updateKycStatus(borrowerId, newKycStatus)
      .accounts({
        authority: authority.publicKey,
        platformConfig: platformConfigAccount,
        borrower: borrowerAccount,
      })
      .signers([authority])
      .rpc();

    // Verify KYC status was updated
    const borrowerData = await program.account.borrower.fetch(borrowerAccount);
    expect(borrowerData.kycStatus).to.deep.equal(newKycStatus);
  });

  it("Updates borrower risk score", async () => {
    const borrowerId = "borrower-001";
    const newRiskScore = 750;

    await program.methods
      .updateRiskScore(borrowerId, newRiskScore)
      .accounts({
        authority: authority.publicKey,
        platformConfig: platformConfigAccount,
        borrower: borrowerAccount,
      })
      .signers([authority])
      .rpc();

    // Verify risk score was updated
    const borrowerData = await program.account.borrower.fetch(borrowerAccount);
    expect(borrowerData.riskScore).to.equal(newRiskScore);
  });

  it("Updates borrower metadata", async () => {
    const borrowerId = "borrower-001";
    const newMetadataUri = "ipfs://QmUpdated456";

    await program.methods
      .updateMetadata(borrowerId, newMetadataUri)
      .accounts({
        wallet: borrower.publicKey,
        borrower: borrowerAccount,
      })
      .signers([borrower])
      .rpc();

    // Verify metadata was updated
    const borrowerData = await program.account.borrower.fetch(borrowerAccount);
    expect(borrowerData.metadataUri).to.equal(newMetadataUri);
  });

  it("Gets borrower information", async () => {
    const borrowerId = "borrower-001";

    await program.methods
      .getBorrowerInfo(borrowerId)
      .accounts({
        borrower: borrowerAccount,
      })
      .rpc();

    // Verify borrower info is accessible
    const borrowerData = await program.account.borrower.fetch(borrowerAccount);
    expect(borrowerData.borrowerId).to.equal(borrowerId);
  });

  it("Rejects unauthorized KYC status update", async () => {
    const unauthorizedUser = Keypair.generate();
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(unauthorizedUser.publicKey, anchor.web3.LAMPORTS_PER_SOL)
    );

    const borrowerId = "borrower-001";
    const newKycStatus = { rejected: {} };

    try {
      await program.methods
        .updateKycStatus(borrowerId, newKycStatus)
        .accounts({
          authority: unauthorizedUser.publicKey,
          platformConfig: platformConfigAccount,
          borrower: borrowerAccount,
        })
        .signers([unauthorizedUser])
        .rpc();
      expect.fail("Should have thrown error for unauthorized access");
    } catch (error) {
      expect(error.message).to.include("UnauthorizedAccess");
    }
  });

  it("Rejects invalid risk score", async () => {
    const borrowerId = "borrower-001";
    const invalidRiskScore = 1500; // Above max 1000

    try {
      await program.methods
        .updateRiskScore(borrowerId, invalidRiskScore)
        .accounts({
          authority: authority.publicKey,
          platformConfig: platformConfigAccount,
          borrower: borrowerAccount,
        })
        .signers([authority])
        .rpc();
      expect.fail("Should have thrown error for invalid risk score");
    } catch (error) {
      expect(error.message).to.include("InvalidRiskScore");
    }
  });

  it("Rejects borrower not found", async () => {
    const invalidBorrowerId = "nonexistent-borrower";

    try {
      await program.methods
        .updateKycStatus(invalidBorrowerId, { approved: {} })
        .accounts({
          authority: authority.publicKey,
          platformConfig: platformConfigAccount,
          borrower: borrowerAccount,
        })
        .signers([authority])
        .rpc();
      expect.fail("Should have thrown error for borrower not found");
    } catch (error) {
      expect(error.message).to.include("BorrowerNotFound");
    }
  });
});
