#!/usr/bin/env node

/**
 * Script to create a test USDC token on a local Solana validator
 * This is for development purposes only
 */

const { Connection, Keypair, PublicKey, SystemProgram, Transaction } = require('@solana/web3.js');
const { Token, TOKEN_PROGRAM_ID, MintLayout } = require('@solana/spl-token');
const fs = require('fs');
const path = require('path');

// Configuration
const DECIMALS = 6; // USDC has 6 decimals
const LOCAL_WALLET_PATH = path.join(require('os').homedir(), '.config', 'solana', 'id.json');
const RPC_URL = 'http://localhost:8899';

async function main() {
  console.log('Creating test USDC token on local Solana validator...');

  // Connect to the local Solana cluster
  const connection = new Connection(RPC_URL, 'confirmed');

  // Load the local wallet
  if (!fs.existsSync(LOCAL_WALLET_PATH)) {
    console.error(`Error: Wallet keypair not found at ${LOCAL_WALLET_PATH}`);
    console.error('Create a wallet using: solana-keygen new --no-bip39-passphrase -o ~/.config/solana/id.json');
    process.exit(1);
  }

  const walletKeypairBuffer = JSON.parse(fs.readFileSync(LOCAL_WALLET_PATH, 'utf-8'));
  const walletKeypair = Keypair.fromSecretKey(Buffer.from(walletKeypairBuffer));
  const walletPublicKey = walletKeypair.publicKey;

  console.log(`Using wallet: ${walletPublicKey.toString()}`);

  // Check wallet balance
  const balance = await connection.getBalance(walletPublicKey);
  console.log(`Wallet balance: ${balance / 10**9} SOL`);

  if (balance < 10**9) {
    console.warn('Warning: Wallet balance is low. Airdropping SOL...');
    try {
      const signature = await connection.requestAirdrop(walletPublicKey, 2 * 10**9);
      await connection.confirmTransaction(signature);
      console.log('Airdrop successful!');
    } catch (err) {
      console.error('Error requesting airdrop:', err);
      process.exit(1);
    }
  }

  // Create a new token mint
  const mintKeypair = Keypair.generate();
  console.log(`Creating mint: ${mintKeypair.publicKey.toString()}`);

  // Calculate the rent for the token mint account
  const mintRent = await connection.getMinimumBalanceForRentExemption(MintLayout.span);

  // Create a transaction to create the mint account
  const createMintTransaction = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: walletPublicKey,
      newAccountPubkey: mintKeypair.publicKey,
      lamports: mintRent,
      space: MintLayout.span,
      programId: TOKEN_PROGRAM_ID
    })
  );

  try {
    // Initialize the token mint
    const token = await Token.createMint(
      connection,
      walletKeypair,
      walletPublicKey,
      walletPublicKey, // Freeze authority (none)
      DECIMALS,
      TOKEN_PROGRAM_ID
    );

    console.log(`Token mint created: ${token.publicKey.toString()}`);

    // Create a token account for the wallet
    const tokenAccount = await token.getOrCreateAssociatedAccountInfo(walletPublicKey);
    console.log(`Token account created: ${tokenAccount.address.toString()}`);

    // Mint some tokens to the wallet
    const mintAmount = 1_000_000 * 10**DECIMALS; // 1 million USDC
    await token.mintTo(
      tokenAccount.address,
      walletPublicKey,
      [],
      mintAmount
    );

    console.log(`Minted ${mintAmount / 10**DECIMALS} tokens to ${tokenAccount.address.toString()}`);

    // Update token metadata to look like USDC
    console.log(`\nTest USDC token created successfully!`);
    console.log(`Token Mint Address: ${token.publicKey.toString()}`);
    console.log(`Token Account: ${tokenAccount.address.toString()}`);
    console.log(`Balance: ${mintAmount / 10**DECIMALS} USDC`);

    // Update .env files with the new token mint
    updateEnvFiles(token.publicKey.toString());

    console.log('\nRemember: This is a test token for development purposes only!');
  } catch (err) {
    console.error('Error creating token:', err);
    process.exit(1);
  }
}

function updateEnvFiles(mintAddress) {
  try {
    // Update API .env
    const apiEnvPath = path.join(process.cwd(), 'api', '.env');
    if (fs.existsSync(apiEnvPath)) {
      let apiEnv = fs.readFileSync(apiEnvPath, 'utf8');
      apiEnv = apiEnv.replace(/USDC_MINT=.*$/m, `USDC_MINT=${mintAddress}`);
      fs.writeFileSync(apiEnvPath, apiEnv);
      console.log('Updated USDC_MINT in api/.env');
    }

    // Update frontend .env
    const appEnvPath = path.join(process.cwd(), 'app', '.env');
    if (fs.existsSync(appEnvPath)) {
      let appEnv = fs.readFileSync(appEnvPath, 'utf8');
      appEnv = appEnv.replace(/REACT_APP_USDC_MINT=.*$/m, `REACT_APP_USDC_MINT=${mintAddress}`);
      fs.writeFileSync(appEnvPath, appEnv);
      console.log('Updated REACT_APP_USDC_MINT in app/.env');
    }
  } catch (err) {
    console.error('Error updating .env files:', err);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
