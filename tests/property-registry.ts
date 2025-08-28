import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import { expect } from "chai";
import { PropertyRegistry } from "../target/types/property_registry";

describe("Property Registry", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.PropertyRegistry as Program<PropertyRegistry>;
  const authority = Keypair.generate();
  const owner = Keypair.generate();

  let propertyAccount: PublicKey;
  let platformConfigAccount: PublicKey;

  const propertyId = "property-001";

  before(async () => {
    // Airdrop SOL to test accounts
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(authority.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL)
    );
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(owner.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL)
    );

    // Derive PDAs
    [propertyAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("property"), owner.publicKey.toBuffer(), Buffer.from(propertyId)],
      program.programId
    );

    [platformConfigAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("platform-config")],
      program.programId
    );
  });

  it("Registers a new property", async () => {
    const value = new anchor.BN(50000000); // $500,000 in cents
    const valuationDate = new anchor.BN(Date.now() / 1000);
    const valuationMethod = 1; // Appraisal
    const valuationProvider = "ABC Appraisal Co";
    const propertyType = 0; // Commercial
    const locationHash = Array.from({ length: 32 }, () => Math.floor(Math.random() * 256));
    const metadataUri = "ipfs://QmProperty123";

    await program.methods
      .registerProperty(
        propertyId,
        value,
        valuationDate,
        valuationMethod,
        valuationProvider,
        propertyType,
        locationHash,
        metadataUri
      )
      .accounts({
        owner: owner.publicKey,
        property: propertyAccount,
        systemProgram: SystemProgram.programId,
      })
      .signers([owner])
      .rpc();

    // Verify property was registered
    const propertyData = await program.account.property.fetch(propertyAccount);
    expect(propertyData.owner.toString()).to.equal(owner.publicKey.toString());
    expect(propertyData.propertyId).to.equal(propertyId);
    expect(propertyData.value.toString()).to.equal(value.toString());
    expect(propertyData.verified).to.equal(false);
    expect(propertyData.activeLoan).to.be.null;
  });

  it("Updates property valuation", async () => {
    const newValue = new anchor.BN(60000000); // $600,000 in cents
    const valuationDate = new anchor.BN(Date.now() / 1000);
    const valuationMethod = 2; // Automated
    const valuationProvider = "XYZ Valuation AI";

    await program.methods
      .updatePropertyValue(newValue, valuationDate, valuationMethod, valuationProvider)
      .accounts({
        owner: owner.publicKey,
        property: propertyAccount,
      })
      .signers([owner])
      .rpc();

    // Verify property value was updated
    const propertyData = await program.account.property.fetch(propertyAccount);
    expect(propertyData.value.toString()).to.equal(newValue.toString());
    expect(propertyData.valuationMethod).to.equal(valuationMethod);
    expect(propertyData.valuationProvider).to.equal(valuationProvider);
  });

  it("Verifies a property", async () => {
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

    await program.methods
      .verifyProperty(propertyId)
      .accounts({
        authority: authority.publicKey,
        platformConfig: platformConfigAccount,
        property: propertyAccount,
      })
      .signers([authority])
      .rpc();

    // Verify property was verified
    const propertyData = await program.account.property.fetch(propertyAccount);
    expect(propertyData.verified).to.equal(true);
  });

  it("Rejects unauthorized property update", async () => {
    const unauthorizedUser = Keypair.generate();
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(unauthorizedUser.publicKey, anchor.web3.LAMPORTS_PER_SOL)
    );

    const newValue = new anchor.BN(70000000);
    const valuationDate = new anchor.BN(Date.now() / 1000);
    const valuationMethod = 1;
    const valuationProvider = "Unauthorized Provider";

    try {
      await program.methods
        .updatePropertyValue(newValue, valuationDate, valuationMethod, valuationProvider)
        .accounts({
          owner: unauthorizedUser.publicKey,
          property: propertyAccount,
        })
        .signers([unauthorizedUser])
        .rpc();
      expect.fail("Should have thrown error for unauthorized access");
    } catch (error) {
      expect(error.message).to.include("Unauthorized");
    }
  });

  it("Rejects unauthorized property verification", async () => {
    const unauthorizedUser = Keypair.generate();
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(unauthorizedUser.publicKey, anchor.web3.LAMPORTS_PER_SOL)
    );

    try {
      await program.methods
        .verifyProperty(propertyId)
        .accounts({
          authority: unauthorizedUser.publicKey,
          platformConfig: platformConfigAccount,
          property: propertyAccount,
        })
        .signers([unauthorizedUser])
        .rpc();
      expect.fail("Should have thrown error for unauthorized access");
    } catch (error) {
      expect(error.message).to.include("Unauthorized");
    }
  });

  it("Handles property metadata correctly", async () => {
    const propertyData = await program.account.property.fetch(propertyAccount);
    expect(propertyData.metadataUri).to.equal("ipfs://QmProperty123");
    expect(propertyData.propertyType).to.equal(0); // Commercial
    expect(propertyData.locationHash).to.have.lengthOf(32);
  });
});
