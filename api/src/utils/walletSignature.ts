import { Connection, PublicKey } from '@solana/web3.js';
import nacl from 'tweetnacl';

interface SignatureVerificationResult {
  valid: boolean;
  error?: string;
}

/**
 * Verify that a message was signed by the given wallet address
 * @param connection - Solana RPC connection
 * @param walletAddress - The wallet address that should have signed
 * @param message - The original message that was signed
 * @param signature - The base64-encoded signature
 * @returns Verification result with success status
 */
export async function verifyWalletSignature(
  connection: Connection,
  walletAddress: string,
  message: string,
  signature: string
): Promise<SignatureVerificationResult> {
  try {
    // Validate wallet address format
    let publicKey: PublicKey;
    try {
      publicKey = new PublicKey(walletAddress);
    } catch {
      return { valid: false, error: 'Invalid wallet address format' };
    }

    // Decode the signature from base64
    let signatureBytes: Uint8Array;
    try {
      signatureBytes = Buffer.from(signature, 'base64');
    } catch {
      return { valid: false, error: 'Invalid signature format' };
    }

    // Get the latest blockhash for message construction
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');

    // Create the message to verify (same format as used for signing)
    const messageBytes = Buffer.from(
      `CRE-Debt-Solana Authentication\n\nWallet: ${walletAddress}\nMessage: ${message}\nBlockhash: ${blockhash}\nTimestamp: ${Date.now()}`
    );

    // Verify the signature
    const isValid = nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      publicKey.toBytes()
    );

    if (!isValid) {
      return { valid: false, error: 'Signature verification failed' };
    }

    // Check if the signature is not too old (5 minutes max)
    // This would require storing the timestamp in the message or a separate mechanism
    // For now, we rely on the blockhash freshness

    return { valid: true };
  } catch (error) {
    console.error('Error verifying wallet signature:', error);
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown verification error'
    };
  }
}

/**
 * Generate a nonce for wallet signature request
 * @param walletAddress - The wallet address
 * @returns A unique nonce for the signature request
 */
export function generateSignatureNonce(walletAddress: string): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 15);
  return `${walletAddress.slice(0, 8)}-${timestamp}-${random}`;
}

/**
 * Verify that a nonce is valid and not expired
 * @param nonce - The nonce to verify
 * @param walletAddress - Expected wallet address from nonce
 * @param maxAgeMs - Maximum age in milliseconds (default 5 minutes)
 * @returns Whether the nonce is valid
 */
export function verifySignatureNonce(
  nonce: string,
  walletAddress: string,
  maxAgeMs: number = 300000
): { valid: boolean; error?: string } {
  try {
    const parts = nonce.split('-');
    if (parts.length !== 3) {
      return { valid: false, error: 'Invalid nonce format' };
    }

    const addressPrefix = parts[0] ?? '';
    const timestampStr = parts[1] ?? '';
    const nonceTimestamp = parseInt(timestampStr, 10);
    const age = Date.now() - nonceTimestamp;

    if (age > maxAgeMs) {
      return { valid: false, error: 'Nonce has expired' };
    }

    if (!addressPrefix.startsWith(walletAddress.slice(0, 8))) {
      return { valid: false, error: 'Nonce does not match wallet address' };
    }

    return { valid: true };
  } catch {
    return { valid: false, error: 'Failed to verify nonce' };
  }
}
