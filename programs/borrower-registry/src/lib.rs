use anchor_lang::prelude::*;

// Temporary program ID - will be replaced with actual after deployment
declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod borrower_registry {
    use super::*;

    /// Register a new borrower
    pub fn register_borrower(
        ctx: Context<RegisterBorrower>,
        borrower_params: BorrowerParams,
    ) -> Result<()> {
        let borrower = &mut ctx.accounts.borrower;
        let clock = Clock::get()?;

        // Initialize borrower data
        borrower.wallet = ctx.accounts.wallet.key();
        borrower.borrower_id = borrower_params.borrower_id;
        borrower.entity_type = borrower_params.entity_type;
        borrower.kyc_status = KycStatus::Pending;
        borrower.kyc_timestamp = clock.unix_timestamp;
        borrower.active_loans = 0;
        borrower.total_borrowed = 0;
        borrower.metadata_uri = borrower_params.metadata_uri;
        borrower.risk_score = 500; // Default neutral risk score
        borrower.created_at = clock.unix_timestamp;

        // Emit borrower registration event
        emit!(BorrowerRegisteredEvent {
            borrower_id: borrower.borrower_id.clone(),
            wallet: borrower.wallet,
            entity_type: borrower.entity_type,
            created_at: borrower.created_at,
        });

        Ok(())
    }

    /// Update KYC status for a borrower
    pub fn update_kyc_status(
        ctx: Context<UpdateKycStatus>,
        borrower_id: String,
        kyc_status: KycStatus,
    ) -> Result<()> {
        let borrower = &mut ctx.accounts.borrower;
        let platform_config = &ctx.accounts.platform_config;

        // Validate permissions
        require!(platform_config.authority == ctx.accounts.authority.key(), ErrorCode::UnauthorizedAccess);
        require!(borrower.borrower_id == borrower_id, ErrorCode::BorrowerNotFound);

        // Update KYC status
        borrower.kyc_status = kyc_status;
        borrower.kyc_timestamp = Clock::get()?.unix_timestamp;

        // Emit KYC update event
        emit!(KycStatusUpdatedEvent {
            borrower_id: borrower.borrower_id.clone(),
            kyc_status: borrower.kyc_status,
            updated_at: borrower.kyc_timestamp,
        });

        Ok(())
    }

    /// Update borrower risk score
    pub fn update_risk_score(
        ctx: Context<UpdateRiskScore>,
        borrower_id: String,
        risk_score: u16,
    ) -> Result<()> {
        let borrower = &mut ctx.accounts.borrower;
        let platform_config = &ctx.accounts.platform_config;

        // Validate permissions and risk score range
        require!(platform_config.authority == ctx.accounts.authority.key(), ErrorCode::UnauthorizedAccess);
        require!(borrower.borrower_id == borrower_id, ErrorCode::BorrowerNotFound);
        require!(risk_score <= 1000, ErrorCode::InvalidRiskScore); // Max 1000 (100%)

        // Update risk score
        borrower.risk_score = risk_score;

        // Emit risk score update event
        emit!(RiskScoreUpdatedEvent {
            borrower_id: borrower.borrower_id.clone(),
            risk_score: borrower.risk_score,
            updated_at: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    /// Update borrower metadata
    pub fn update_metadata(
        ctx: Context<UpdateMetadata>,
        borrower_id: String,
        metadata_uri: String,
    ) -> Result<()> {
        let borrower = &mut ctx.accounts.borrower;

        // Validate ownership and borrower ID
        require!(borrower.wallet == ctx.accounts.wallet.key(), ErrorCode::UnauthorizedAccess);
        require!(borrower.borrower_id == borrower_id, ErrorCode::BorrowerNotFound);

        // Update metadata URI
        borrower.metadata_uri = metadata_uri;

        // Emit metadata update event
        emit!(MetadataUpdatedEvent {
            borrower_id: borrower.borrower_id.clone(),
            metadata_uri: borrower.metadata_uri.clone(),
            updated_at: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    /// Get borrower information (read-only)
    pub fn get_borrower_info(
        ctx: Context<GetBorrowerInfo>,
        borrower_id: String,
    ) -> Result<()> {
        let borrower = &ctx.accounts.borrower;

        // Validate borrower ID
        require!(borrower.borrower_id == borrower_id, ErrorCode::BorrowerNotFound);

        // Emit borrower info event (for off-chain consumption)
        emit!(BorrowerInfoEvent {
            borrower_id: borrower.borrower_id.clone(),
            wallet: borrower.wallet,
            entity_type: borrower.entity_type,
            kyc_status: borrower.kyc_status,
            active_loans: borrower.active_loans,
            total_borrowed: borrower.total_borrowed,
            risk_score: borrower.risk_score,
            created_at: borrower.created_at,
        });

        Ok(())
    }
}

// Account structs
#[account]
pub struct Borrower {
    pub wallet: Pubkey,           // Borrower's wallet address
    pub borrower_id: String,      // Unique identifier
    pub entity_type: u8,          // Type of entity (0=Individual, 1=LLC, 2=Corp, etc.)
    pub kyc_status: KycStatus,    // KYC verification status
    pub kyc_timestamp: i64,       // When KYC was last updated
    pub active_loans: u16,        // Number of active loans
    pub total_borrowed: u64,      // Total amount borrowed (in USDC smallest units)
    pub metadata_uri: String,     // IPFS URI for extended borrower data
    pub risk_score: u16,          // Risk score (0-1000, higher = lower risk)
    pub created_at: i64,          // When borrower was registered
}

#[account]
pub struct PlatformConfig {
    pub authority: Pubkey,        // Platform authority
    pub paused: bool,             // Emergency pause status
}

// Enums
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum KycStatus {
    Pending,     // KYC not submitted
    Submitted,   // KYC submitted, under review
    Approved,    // KYC approved
    Rejected,    // KYC rejected
    Expired,     // KYC expired, needs renewal
}

// Input structs
#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct BorrowerParams {
    pub borrower_id: String,
    pub entity_type: u8,
    pub metadata_uri: String,
}

// Instruction contexts
#[derive(Accounts)]
#[instruction(borrower_params: BorrowerParams)]
pub struct RegisterBorrower<'info> {
    #[account(mut)]
    pub wallet: Signer<'info>,

    #[account(
        init,
        payer = wallet,
        space = 8 + Borrower::INIT_SPACE,
        seeds = [b"borrower", wallet.key().as_ref()],
        bump
    )]
    pub borrower: Account<'info, Borrower>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateKycStatus<'info> {
    pub authority: Signer<'info>,

    pub platform_config: Account<'info, PlatformConfig>,

    #[account(mut)]
    pub borrower: Account<'info, Borrower>,
}

#[derive(Accounts)]
pub struct UpdateRiskScore<'info> {
    pub authority: Signer<'info>,

    pub platform_config: Account<'info, PlatformConfig>,

    #[account(mut)]
    pub borrower: Account<'info, Borrower>,
}

#[derive(Accounts)]
pub struct UpdateMetadata<'info> {
    #[account(mut)]
    pub wallet: Signer<'info>,

    #[account(
        mut,
        has_one = wallet @ ErrorCode::UnauthorizedAccess,
    )]
    pub borrower: Account<'info, Borrower>,
}

#[derive(Accounts)]
pub struct GetBorrowerInfo<'info> {
    pub borrower: Account<'info, Borrower>,
}

// Events
#[event]
pub struct BorrowerRegisteredEvent {
    pub borrower_id: String,
    pub wallet: Pubkey,
    pub entity_type: u8,
    pub created_at: i64,
}

#[event]
pub struct KycStatusUpdatedEvent {
    pub borrower_id: String,
    pub kyc_status: KycStatus,
    pub updated_at: i64,
}

#[event]
pub struct RiskScoreUpdatedEvent {
    pub borrower_id: String,
    pub risk_score: u16,
    pub updated_at: i64,
}

#[event]
pub struct MetadataUpdatedEvent {
    pub borrower_id: String,
    pub metadata_uri: String,
    pub updated_at: i64,
}

#[event]
pub struct BorrowerInfoEvent {
    pub borrower_id: String,
    pub wallet: Pubkey,
    pub entity_type: u8,
    pub kyc_status: KycStatus,
    pub active_loans: u16,
    pub total_borrowed: u64,
    pub risk_score: u16,
    pub created_at: i64,
}

// Error codes
#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized access")]
    UnauthorizedAccess,

    #[msg("Borrower not found")]
    BorrowerNotFound,

    #[msg("Invalid risk score - must be between 0 and 1000")]
    InvalidRiskScore,
}

// Account size calculations
impl Borrower {
    pub const INIT_SPACE: usize = 32 +  // wallet
                                  36 +  // borrower_id (max 32 chars)
                                  1 +   // entity_type
                                  1 +   // kyc_status
                                  8 +   // kyc_timestamp
                                  2 +   // active_loans
                                  8 +   // total_borrowed
                                  36 +  // metadata_uri (max 32 chars)
                                  2 +   // risk_score
                                  8;    // created_at
}
