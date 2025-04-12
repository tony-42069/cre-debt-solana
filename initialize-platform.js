#!/usr/bin/env node

/**
 * Script to initialize the CRE-Debt-Solana platform configuration
 * This creates the platform config account and sets initial parameters
 */

const anchor = require('@coral-xyz/anchor');
const { Connection, Keypair, PublicKey } = require('@solana/web3.js');
const { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } = require('@solana/spl-token');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), 'api', '.env') });

// Configuration
const RPC_URL = process.env.SOLANA_RPC_URL || 'http://localhost:8899';
const PROGRAM_ID = process.env.LOAN_CORE_PROGRAM_ID;
const USDC_MINT = process.env.USDC_MINT;
const LOCAL_WALLET_PATH = path.join(require('os').homedir(), '.config', 'solana', 'id.json');
const IDL_PATH = path.join(process.cwd(), 'target', 'idl', 'loan_core.json');

// Default platform configuration
const DEFAULT_CONFIG = {
  maxLtv: 9000,              // 90.00% (basis points)
  minLoanAmount: 1000 * 10**6, // 1,000 USDC (in smallest units)
  maxLoanAmount: 1000000 * 10**6, // 1,000,000 USDC (in smallest units)
  originationFee: 100,       // 1.00% (basis points)
  servicingFee: 25,          // 0.25% (basis points)
  minInterestRate: 800,      // 8.00% (basis points)
  defaultInterestRate: 1000, // 10.00% (basis points)
  lateFeeRate: 500,          // 5.00% (basis points)
  gracePeriodDays: 10,       // 10 days
};

async function main() {
  console.log('Initializing CRE-Debt-Solana platform configuration...');

  // Validate required values
  if (!PROGRAM_ID) {
    console.error('Error: LOAN_CORE_PROGRAM_ID is not defined in .env');
    process.exit(1);
  }

  if (!USDC_MINT) {
    console.error('Error: USDC_MINT is not defined in .env');
    process.exit(1);
  }

  // Connect to the Solana cluster
  const connection = new Connection(RPC_URL, 'confirmed');

  // Load wallet keypair
  if (!fs.existsSync(LOCAL_WALLET_PATH)) {
    console.error(`Error: Wallet keypair not found at ${LOCAL_WALLET_PATH}`);
    console.error('Create a wallet using: solana-keygen new --no-bip39-passphrase -o ~/.config/solana/id.json');
    process.exit(1);
  }

  const walletKeypairBuffer = JSON.parse(fs.readFileSync(LOCAL_WALLET_PATH, 'utf-8'));
  const walletKeypair = Keypair.fromSecretKey(Buffer.from(walletKeypairBuffer));
  const wallet = new anchor.Wallet(walletKeypair);
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: 'confirmed',
  });
  
  anchor.setProvider(provider);

  // Load the IDL
  let idl;
  try {
    idl = JSON.parse(fs.readFileSync(IDL_PATH, 'utf8'));
  } catch (err) {
    console.error(`Error loading IDL: ${err.message}`);
    console.error('Make sure you have built the program with "anchor build"');
    process.exit(1);
  }

  // Create a program instance
  const programId = new PublicKey(PROGRAM_ID);
  const program = new anchor.Program(idl, programId, provider);

  console.log(`Loan Core Program: ${program.programId.toString()}`);
  console.log(`Admin Wallet: ${wallet.publicKey.toString()}`);
  console.log(`USDC Mint: ${USDC_MINT}`);

  // Get associated token account for admin
  const usdcMintPubkey = new PublicKey(USDC_MINT);
  const treasuryTokenAccount = await getAssociatedTokenAddress(
    usdcMintPubkey,
    wallet.publicKey
  );

  console.log(`Treasury Token Account: ${treasuryTokenAccount.toString()}`);

  // Find platform config PDA
  const [platformConfigPda] = await PublicKey.findProgramAddressSync(
    [Buffer.from('platform-config')],
    program.programId
  );

  console.log(`Platform Config PDA: ${platformConfigPda.toString()}`);

  // Check if platform config already exists
  const platformConfigAccount = await connection.getAccountInfo(platformConfigPda);
  if (platformConfigAccount !== null) {
    console.log('Platform configuration already exists!');
    console.log('If you want to re-initialize, consider updating instead.');
    
    try {
      // Fetch and display current config
      const config = await program.account.platformConfig.fetch(platformConfigPda);
      console.log('\nCurrent Configuration:');
      console.log(`Max LTV: ${config.maxLtv / 100}%`);
      console.log(`Min Loan Amount: ${config.minLoanAmount / 10**6} USDC`);
      console.log(`Max Loan Amount: ${config.maxLoanAmount / 10**6} USDC`);
      console.log(`Origination Fee: ${config.originationFee / 100}%`);
      console.log(`Servicing Fee: ${config.servicingFee / 100}%`);
      console.log(`Min Interest Rate: ${config.minInterestRate / 100}%`);
      console.log(`Default Interest Rate: ${config.defaultInterestRate / 100}%`);
      console.log(`Late Fee Rate: ${config.lateFeeRate / 100}%`);
      console.log(`Grace Period: ${config.gracePeriodDays} days`);
    } catch (err) {
      console.error('Error fetching platform config:', err);
    }
    
    process.exit(0);
  }

  // Initialize platform configuration
  try {
    console.log('Initializing platform configuration...');
    
    const tx = await program.methods
      .initialize(
        DEFAULT_CONFIG.maxLtv,
        DEFAULT_CONFIG.minLoanAmount,
        DEFAULT_CONFIG.maxLoanAmount,
        DEFAULT_CONFIG.originationFee,
        DEFAULT_CONFIG.servicingFee,
        DEFAULT_CONFIG.minInterestRate,
        DEFAULT_CONFIG.defaultInterestRate,
        DEFAULT_CONFIG.lateFeeRate,
        DEFAULT_CONFIG.gracePeriodDays
      )
      .accounts({
        authority: wallet.publicKey,
        treasury: wallet.publicKey,
        treasuryTokenAccount: treasuryTokenAccount,
        platformConfig: platformConfigPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();
    
    console.log(`Transaction signature: ${tx}`);
    console.log('Platform configuration initialized successfully!');
    
    // Display configuration
    console.log('\nConfiguration:');
    console.log(`Max LTV: ${DEFAULT_CONFIG.maxLtv / 100}%`);
    console.log(`Min Loan Amount: ${DEFAULT_CONFIG.minLoanAmount / 10**6} USDC`);
    console.log(`Max Loan Amount: ${DEFAULT_CONFIG.maxLoanAmount / 10**6} USDC`);
    console.log(`Origination Fee: ${DEFAULT_CONFIG.originationFee / 100}%`);
    console.log(`Servicing Fee: ${DEFAULT_CONFIG.servicingFee / 100}%`);
    console.log(`Min Interest Rate: ${DEFAULT_CONFIG.minInterestRate / 100}%`);
    console.log(`Default Interest Rate: ${DEFAULT_CONFIG.defaultInterestRate / 100}%`);
    console.log(`Late Fee Rate: ${DEFAULT_CONFIG.lateFeeRate / 100}%`);
    console.log(`Grace Period: ${DEFAULT_CONFIG.gracePeriodDays} days`);
    
  } catch (err) {
    console.error('Error initializing platform configuration:', err);
    process.exit(1);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
