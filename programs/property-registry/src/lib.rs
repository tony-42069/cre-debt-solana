use anchor_lang::prelude::*;
use anchor_spl::token;

// Temporary program ID - will be replaced with actual after deployment
declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod property_registry {
    use super::*;

    /// Register a new property
    pub fn register_property(
        ctx: Context<RegisterProperty>,
        property_id: String,
        value: u64,
        valuation_date: i64,
        valuation_method: u8,
        valuation_provider: String,
        property_type: u8,
        location_hash: [u8; 32],
        metadata_uri: String,
    ) -> Result<()> {
        let property = &mut ctx.accounts.property;
        
        // Initialize property data
        property.owner = ctx.accounts.owner.key();
        property.property_id = property_id;
        property.value = value;
        property.valuation_date = valuation_date;
        property.valuation_method = valuation_method;
        property.valuation_provider = valuation_provider;
        property.property_type = property_type;
        property.location_hash = location_hash;
        property.metadata_uri = metadata_uri;
        property.verified = false;
        property.active_loan = None;
        
        Ok(())
    }

    /// Update property valuation
    pub fn update_property_value(
        ctx: Context<UpdatePropertyValue>,
        new_value: u64,
        valuation_date: i64,
        valuation_method: u8,
        valuation_provider: String,
    ) -> Result<()> {
        let property = &mut ctx.accounts.property;
        
        // Verify owner
        if property.owner != ctx.accounts.owner.key() {
            return Err(ErrorCode::Unauthorized.into());
        }
        
        // Update valuation data
        property.value = new_value;
        property.valuation_date = valuation_date;
        property.valuation_method = valuation_method;
        property.valuation_provider = valuation_provider;
        
        Ok(())
    }

    /// Verify a property
    pub fn verify_property(
        ctx: Context<VerifyProperty>,
        property_id: String,
    ) -> Result<()> {
        let property = &mut ctx.accounts.property;
        
        // Verify platform authority
        if ctx.accounts.platform_config.authority != ctx.accounts.authority.key() {
            return Err(ErrorCode::Unauthorized.into());
        }
        
        // Mark as verified
        property.verified = true;
        
        Ok(())
    }
}

// Account structs
#[account]
pub struct PlatformConfig {
    pub authority: Pubkey,
    pub treasury: Pubkey,
    pub max_ltv: u16,
    pub min_loan_amount: u64,
    pub max_loan_amount: u64,
    pub origination_fee: u16,
    pub servicing_fee: u16,
    pub min_interest_rate: u16,
    pub default_interest_rate: u16,
    pub late_fee_rate: u16,
    pub grace_period_days: u8,
    pub treasury_token_account: Pubkey,
    pub paused: bool,
}

#[account]
pub struct Property {
    pub owner: Pubkey,            // Property owner's wallet
    pub property_id: String,      // Unique identifier
    pub value: u64,               // Assessed value in USD cents
    pub valuation_date: i64,      // Valuation timestamp
    pub valuation_method: u8,     // Method used for valuation
    pub valuation_provider: String, // Entity that provided valuation
    pub property_type: u8,        // Type of property
    pub location_hash: [u8; 32],  // Hash of location data
    pub metadata_uri: String,     // IPFS URI for extended data
    pub active_loan: Option<Pubkey>, // Reference to active loan if any
    pub verified: bool,           // Verification status
}

// Instruction contexts

#[derive(Accounts)]
#[instruction(property_id: String)]
pub struct RegisterProperty<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    
    #[account(
        init,
        payer = owner,
        space = 8 + Property::INIT_SPACE,
        seeds = [b"property", owner.key().as_ref(), property_id.as_bytes()],
        bump
    )]
    pub property: Account<'info, Property>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdatePropertyValue<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    
    #[account(
        mut,
        has_one = owner @ ErrorCode::Unauthorized,
    )]
    pub property: Account<'info, Property>,
}

#[derive(Accounts)]
pub struct VerifyProperty<'info> {
    #[account()]
    pub authority: Signer<'info>,
    
    #[account()]
    pub platform_config: Account<'info, PlatformConfig>,
    
    #[account(mut)]
    pub property: Account<'info, Property>,
}

// Error codes

#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized access")]
    Unauthorized,
    
    #[msg("Property not found")]
    PropertyNotFound,
    
    #[msg("Property already verified")]
    AlreadyVerified,
}

impl Property {
    pub const INIT_SPACE: usize = 
        32 +  // owner: Pubkey
        36 +  // property_id: String (max 32 chars)
        8 +   // value: u64
        8 +   // valuation_date: i64
        1 +   // valuation_method: u8
        36 +  // valuation_provider: String (max 32 chars)
        1 +   // property_type: u8
        32 +  // location_hash: [u8; 32]
        36 +  // metadata_uri: String (max 32 chars)
        1 +   // verified: bool
        33;   // active_loan: Option<Pubkey> (1 + 32)
}
