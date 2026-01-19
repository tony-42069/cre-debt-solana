//! # Token PDA Management Utilities
//!
//! **Version:** 1.0.0
//! **Description:** Helper functions for deriving PDAs for token accounts
//!
//! ## Features
//! - Derive PDA for associated token accounts
//! - Derive PDA for token mint authority
//! - Derive PDA for treasury token accounts
//! - Safe token account validation

use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{Mint, Token};

/// Seeds for platform treasury token account
pub const TREASURY_SEED: &[u8] = b"treasury-token";

/// Seeds for platform mint authority
pub const MINT_AUTHORITY_SEED: &[u8] = b"mint-authority";

/// Seeds for borrower token account (uses borrower wallet as seed)
pub const BORROWER_TOKEN_SEED: &[u8] = b"borrower-token";

/// Derive the address for the platform treasury token account
/// This account holds the platform's USDC reserves for loan disbursements
#[derive(Accounts)]
pub struct TreasuryTokenAccount<'info> {
    #[account(
        init,
        payer = authority,
        associated_token::mint = mint,
        associated_token::authority = treasury,
    )]
    pub treasury_token_account: Account<'info, TokenAccount>,
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub treasury: Account<'info, TokenAccount>,
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

/// Derive PDA for a borrower's associated token account
pub fn get_borrower_token_pda(borrower: Pubkey, mint: Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(
        &[
            b"associated-token-account",
            borrower.as_ref(),
            mint.as_ref(),
        ],
        &anchor_spl::associated_token::ID,
    )
}

/// Derive PDA for platform treasury token account
pub fn get_treasury_token_pda(treasury: Pubkey, mint: Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(
        &[
            TREASURY_SEED,
            treasury.as_ref(),
            mint.as_ref(),
        ],
        &anchor_spl::associated_token::ID,
    )
}

/// Derive PDA for mint authority
pub fn get_mint_authority_pda(platform_config: Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(
        &[MINT_AUTHORITY_SEED, platform_config.as_ref()],
        &anchor_lang::id(),
    )
}

/// Derive PDA for loan-specific token account
pub fn get_loan_token_pda(loan: Pubkey, mint: Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(
        &[
            b"loan-token",
            loan.as_ref(),
            mint.as_ref(),
        ],
        &anchor_lang::id(),
    )
}

/// Initialize a borrower token account if it doesn't exist
#[derive(Accounts)]
pub struct InitializeBorrowerToken<'info> {
    #[account(mut)]
    pub borrower: Signer<'info>,
    pub mint: Account<'info, Mint>,
    #[account(
        init_if_needed,
        payer = borrower,
        associated_token::mint = mint,
        associated_token::authority = borrower,
    )]
    pub borrower_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

/// Token account validation helper
pub fn assert_token_account_matches(
    token_account: &AccountInfo,
    expected_owner: &Pubkey,
    expected_mint: &Pubkey,
) -> Result<()> {
    let token_account_data = token_account.try_borrow_data()?;
    let token_account = anchor_spl::token::TokenAccount::try_deserialize(
        &mut token_account_data.as_slice(),
    )?;

    require!(
        token_account.owner == *expected_owner,
        ErrorCode::TokenAccountOwnerMismatch
    );
    require!(
        token_account.mint == *expected_mint,
        ErrorCode::TokenAccountMintMismatch
    );

    Ok(())
}

/// Get minimum balance for a token account (rent-exempt)
pub fn get_token_account_min_balance(token_program: &AccountInfo) -> Result<u64> {
    Ok(anchor_lang::Rent::get()?.minimum_balance(
        anchor_spl::token::TokenAccount::LEN,
    ))
}

/// Validate token amount for transfer
pub fn validate_transfer_amount(amount: u64, minimum: u64, maximum: u64) -> Result<()> {
    require!(amount >= minimum, ErrorCode::TransferAmountTooSmall);
    require!(amount <= maximum, ErrorCode::TransferAmountTooLarge);
    Ok(())
}
