use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use std::ops::Deref;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"); // Replace with your program ID

#[program]
pub mod loan_core {
    use super::*;

    /// Initialize the platform configuration
    pub fn initialize(
        ctx: Context<Initialize>,
        max_ltv: u16,
        min_loan_amount: u64,
        max_loan_amount: u64,
        origination_fee: u16,
        servicing_fee: u16,
        min_interest_rate: u16,
        default_interest_rate: u16,
        late_fee_rate: u16,
        grace_period_days: u8,
    ) -> Result<()> {
        let config = &mut ctx.accounts.platform_config;
        
        // Set the authority (admin)
        config.authority = ctx.accounts.authority.key();
        config.treasury = ctx.accounts.treasury.key();
        
        // Set configuration parameters
        config.max_ltv = max_ltv;
        config.min_loan_amount = min_loan_amount;
        config.max_loan_amount = max_loan_amount;
        config.origination_fee = origination_fee;
        config.servicing_fee = servicing_fee;
        config.min_interest_rate = min_interest_rate;
        config.default_interest_rate = default_interest_rate;
        config.late_fee_rate = late_fee_rate;
        config.grace_period_days = grace_period_days;
        config.treasury_token_account = ctx.accounts.treasury_token_account.key();
        config.paused = false;
        
        Ok(())
    }

    /// Create a new loan application
    pub fn create_loan(
        ctx: Context<CreateLoan>,
        loan_id: String,
        property_id: String,
        property_value: u64,
        ltv_ratio: u16,
        collateral_type: CollateralType,
        principal_amount: u64,
        interest_rate: u16,
        term_months: u8,
        payment_frequency: PaymentFrequency,
        legal_doc_hash: [u8; 32],
        ucc_filing_reference: String,
    ) -> Result<()> {
        let config = &ctx.accounts.platform_config;
        let loan = &mut ctx.accounts.loan;
        let clock = Clock::get()?;
        
        // Validate loan parameters
        if principal_amount < config.min_loan_amount {
            return Err(ErrorCode::LoanTooSmall.into());
        }
        
        if principal_amount > config.max_loan_amount {
            return Err(ErrorCode::LoanTooLarge.into());
        }
        
        if ltv_ratio > config.max_ltv {
            return Err(ErrorCode::LtvExceeded.into());
        }
        
        if !ctx.accounts.borrower.kyc_verified {
            return Err(ErrorCode::KycRequired.into());
        }
        
        // Calculate the maximum loan amount based on property value and LTV ratio
        let max_loan_amount = (property_value as u128)
            .checked_mul(ltv_ratio as u128)
            .unwrap()
            .checked_div(10000)
            .unwrap() as u64;
            
        if principal_amount > max_loan_amount {
            return Err(ErrorCode::LtvExceeded.into());
        }
        
        // Initialize loan data
        loan.loan_id = loan_id;
        loan.creation_timestamp = clock.unix_timestamp;
        loan.status = LoanStatus::Pending;
        loan.borrower = ctx.accounts.borrower.key();
        loan.lender = config.authority; // Initially, the platform is the lender
        loan.property_id = property_id;
        loan.property_value = property_value;
        loan.ltv_ratio = ltv_ratio;
        loan.collateral_type = collateral_type;
        loan.principal_amount = principal_amount;
        loan.interest_rate = interest_rate;
        loan.term_months = term_months;
        loan.payment_frequency = payment_frequency;
        loan.origination_fee = config.origination_fee;
        loan.next_payment_due = 0; // Will be set upon funding
        loan.total_payments_made = 0;
        loan.remaining_principal = principal_amount;
        loan.legal_doc_hash = legal_doc_hash;
        loan.ucc_filing_reference = ucc_filing_reference;
        loan.kyc_verified = ctx.accounts.borrower.kyc_verified;
        
        // Set PDAs bumps
        loan.bumps = LoanBumps {
            loan_bump: *ctx.bumps.get("loan").unwrap(),
            vault_bump: *ctx.bumps.get("vault").unwrap(),
        };
        
        // Emit event
        emit!(LoanCreatedEvent {
            loan_id: loan.loan_id.clone(),
            borrower: loan.borrower,
            principal_amount: loan.principal_amount,
            property_id: loan.property_id.clone(),
            timestamp: clock.unix_timestamp,
        });
        
        Ok(())
    }

    /// Approve a pending loan
    pub fn approve_loan(
        ctx: Context<ApproveLoan>,
        _loan_id: String, // For logging only
    ) -> Result<()> {
        let loan = &mut ctx.accounts.loan;
        let clock = Clock::get()?;
        
        // Verify loan is in the correct state
        if loan.status != LoanStatus::Pending {
            return Err(ErrorCode::InvalidLoanStatus.into());
        }
        
        // Update loan status
        loan.status = LoanStatus::Approved;
        
        // Emit event
        emit!(LoanApprovedEvent {
            loan_id: loan.loan_id.clone(),
            approver: ctx.accounts.authority.key(),
            timestamp: clock.unix_timestamp,
        });
        
        Ok(())
    }

    /// Fund an approved loan
    pub fn fund_loan(
        ctx: Context<FundLoan>,
        _loan_id: String, // For logging only
    ) -> Result<()> {
        let loan = &mut ctx.accounts.loan;
        let config = &ctx.accounts.platform_config;
        let clock = Clock::get()?;
        
        // Verify loan is in the correct state
        if loan.status != LoanStatus::Approved {
            return Err(ErrorCode::InvalidLoanStatus.into());
        }
        
        // Calculate the origination fee
        let origination_fee_amount = (loan.principal_amount as u128)
            .checked_mul(loan.origination_fee as u128)
            .unwrap()
            .checked_div(10000)
            .unwrap() as u64;
            
        // Calculate the amount to transfer to borrower (principal minus fees)
        let transfer_amount = loan.principal_amount
            .checked_sub(origination_fee_amount)
            .unwrap();
            
        // Transfer origination fee to treasury
        let cpi_accounts_fee = Transfer {
            from: ctx.accounts.lender_token_account.to_account_info(),
            to: ctx.accounts.treasury_token_account.to_account_info(),
            authority: ctx.accounts.lender.to_account_info(),
        };
        
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx_fee = CpiContext::new(cpi_program.clone(), cpi_accounts_fee);
        
        token::transfer(cpi_ctx_fee, origination_fee_amount)?;
        
        // Transfer principal to borrower
        let cpi_accounts_principal = Transfer {
            from: ctx.accounts.lender_token_account.to_account_info(),
            to: ctx.accounts.borrower_token_account.to_account_info(),
            authority: ctx.accounts.lender.to_account_info(),
        };
        
        let cpi_ctx_principal = CpiContext::new(cpi_program, cpi_accounts_principal);
        
        token::transfer(cpi_ctx_principal, transfer_amount)?;
        
        // Set loan to active and update payment schedule
        loan.status = LoanStatus::Active;
        
        // Calculate first payment due date (30 days from now for monthly)
        match loan.payment_frequency {
            PaymentFrequency::Monthly => {
                loan.next_payment_due = clock.unix_timestamp + (30 * 24 * 60 * 60);
            }
            PaymentFrequency::Quarterly => {
                loan.next_payment_due = clock.unix_timestamp + (90 * 24 * 60 * 60);
            }
            PaymentFrequency::Semiannual => {
                loan.next_payment_due = clock.unix_timestamp + (180 * 24 * 60 * 60);
            }
            PaymentFrequency::Annual => {
                loan.next_payment_due = clock.unix_timestamp + (365 * 24 * 60 * 60);
            }
            PaymentFrequency::BulletPayment => {
                // For bullet payment, next payment is at the end of term
                loan.next_payment_due = clock.unix_timestamp + ((loan.term_months as i64) * 30 * 24 * 60 * 60);
            }
        }
        
        // Emit event
        emit!(LoanFundedEvent {
            loan_id: loan.loan_id.clone(),
            borrower: loan.borrower,
            lender: ctx.accounts.lender.key(),
            amount: loan.principal_amount,
            fees: origination_fee_amount,
            timestamp: clock.unix_timestamp,
        });
        
        Ok(())
    }

    /// Make a loan payment
    pub fn make_payment(
        ctx: Context<MakePayment>,
        _loan_id: String, // For logging only
        amount: u64,
    ) -> Result<()> {
        let loan = &mut ctx.accounts.loan;
        let config = &ctx.accounts.platform_config;
        let clock = Clock::get()?;
        
        // Verify loan is in the correct state
        if loan.status != LoanStatus::Active && loan.status != LoanStatus::Delinquent {
            return Err(ErrorCode::InvalidLoanStatus.into());
        }
        
        // Calculate interest due
        let interest_rate_decimal = (loan.interest_rate as f64) / 10000.0;
        let time_since_last_payment_days = if loan.total_payments_made == 0 {
            // First payment - calculate from funding date
            ((clock.unix_timestamp - loan.creation_timestamp) as f64) / (24.0 * 60.0 * 60.0)
        } else {
            // Calculate from last payment due date
            ((clock.unix_timestamp - loan.next_payment_due) as f64) / (24.0 * 60.0 * 60.0) + 30.0 // Assuming monthly for simplicity
        };
        
        let interest_due = (loan.remaining_principal as f64) * 
            interest_rate_decimal * 
            (time_since_last_payment_days / 365.0);
            
        let interest_due_lamports = (interest_due.ceil() as u64).min(amount);
        
        // Calculate how much goes to principal
        let principal_payment = if amount > interest_due_lamports {
            amount - interest_due_lamports
        } else {
            0
        };
        
        // Calculate servicing fee
        let servicing_fee_amount = (amount as u128)
            .checked_mul(config.servicing_fee as u128)
            .unwrap()
            .checked_div(10000)
            .unwrap() as u64;
        
        // Adjust amounts to account for servicing fee
        let adjusted_interest = if interest_due_lamports > servicing_fee_amount {
            interest_due_lamports - servicing_fee_amount
        } else {
            let remaining_fee = servicing_fee_amount - interest_due_lamports;
            if principal_payment > remaining_fee {
                0
            } else {
                0
            }
        };
        
        let adjusted_principal = if interest_due_lamports > servicing_fee_amount {
            principal_payment
        } else {
            let remaining_fee = servicing_fee_amount - interest_due_lamports;
            if principal_payment > remaining_fee {
                principal_payment - remaining_fee
            } else {
                0
            }
        };
        
        // Transfer payment to lender
        let payment_transfer_amount = amount - servicing_fee_amount;
        
        // Transfer servicing fee to treasury
        let cpi_accounts_fee = Transfer {
            from: ctx.accounts.borrower_token_account.to_account_info(),
            to: ctx.accounts.treasury_token_account.to_account_info(),
            authority: ctx.accounts.borrower.to_account_info(),
        };
        
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx_fee = CpiContext::new(cpi_program.clone(), cpi_accounts_fee);
        
        token::transfer(cpi_ctx_fee, servicing_fee_amount)?;
        
        // Transfer payment to lender
        let cpi_accounts_payment = Transfer {
            from: ctx.accounts.borrower_token_account.to_account_info(),
            to: ctx.accounts.lender_token_account.to_account_info(),
            authority: ctx.accounts.borrower.to_account_info(),
        };
        
        let cpi_ctx_payment = CpiContext::new(cpi_program, cpi_accounts_payment);
        
        token::transfer(cpi_ctx_payment, payment_transfer_amount)?;
        
        // Update loan state
        loan.remaining_principal = loan.remaining_principal
            .checked_sub(adjusted_principal)
            .unwrap_or(0);
            
        loan.total_payments_made = loan.total_payments_made
            .checked_add(amount)
            .unwrap();
            
        // Update payment schedule
        match loan.payment_frequency {
            PaymentFrequency::Monthly => {
                loan.next_payment_due = loan.next_payment_due + (30 * 24 * 60 * 60);
            }
            PaymentFrequency::Quarterly => {
                loan.next_payment_due = loan.next_payment_due + (90 * 24 * 60 * 60);
            }
            PaymentFrequency::Semiannual => {
                loan.next_payment_due = loan.next_payment_due + (180 * 24 * 60 * 60);
            }
            PaymentFrequency::Annual => {
                loan.next_payment_due = loan.next_payment_due + (365 * 24 * 60 * 60);
            }
            PaymentFrequency::BulletPayment => {
                // For bullet payment, next payment remains at end of term
            }
        }
        
        // Change loan status back to Active if it was Delinquent
        if loan.status == LoanStatus::Delinquent {
            loan.status = LoanStatus::Active;
        }
        
        // Check if loan is fully paid
        if loan.remaining_principal == 0 {
            loan.status = LoanStatus::Completed;
        }
        
        // Create a payment record
        let payment = &mut ctx.accounts.payment;
        payment.loan = loan.key();
        payment.payment_number = ctx.accounts.payment_counter.count + 1;
        payment.timestamp = clock.unix_timestamp;
        payment.amount = amount;
        payment.principal_portion = adjusted_principal;
        payment.interest_portion = adjusted_interest;
        payment.fees_portion = servicing_fee_amount;
        payment.status = PaymentStatus::Completed;
        
        // Update payment counter
        let payment_counter = &mut ctx.accounts.payment_counter;
        payment_counter.count += 1;
        
        // Emit event
        emit!(PaymentMadeEvent {
            loan_id: loan.loan_id.clone(),
            payment_number: payment.payment_number,
            amount,
            principal: adjusted_principal,
            interest: adjusted_interest,
            fees: servicing_fee_amount,
            timestamp: clock.unix_timestamp,
        });
        
        Ok(())
    }

    /// Mark a loan as delinquent
    pub fn mark_loan_delinquent(
        ctx: Context<MarkLoanDelinquent>,
        _loan_id: String, // For logging only
    ) -> Result<()> {
        let loan = &mut ctx.accounts.loan;
        let config = &ctx.accounts.platform_config;
        let clock = Clock::get()?;
        
        // Verify loan is in the correct state
        if loan.status != LoanStatus::Active {
            return Err(ErrorCode::InvalidLoanStatus.into());
        }
        
        // Check if payment is overdue
        let grace_period_seconds = (config.grace_period_days as i64) * 24 * 60 * 60;
        if clock.unix_timestamp <= loan.next_payment_due + grace_period_seconds {
            return Err(ErrorCode::PaymentNotOverdue.into());
        }
        
        // Update loan status
        loan.status = LoanStatus::Delinquent;
        
        // Emit event
        emit!(LoanDelinquentEvent {
            loan_id: loan.loan_id.clone(),
            days_overdue: ((clock.unix_timestamp - loan.next_payment_due) / (24 * 60 * 60)) as u16,
            timestamp: clock.unix_timestamp,
        });
        
        Ok(())
    }

    /// Mark a loan as in default
    pub fn mark_loan_default(
        ctx: Context<MarkLoanDefault>,
        _loan_id: String, // For logging only
    ) -> Result<()> {
        let loan = &mut ctx.accounts.loan;
        let config = &ctx.accounts.platform_config;
        let clock = Clock::get()?;
        
        // Verify loan is in the correct state
        if loan.status != LoanStatus::Delinquent {
            return Err(ErrorCode::InvalidLoanStatus.into());
        }
        
        // Check if payment is significantly overdue (90+ days)
        let default_threshold_seconds = 90 * 24 * 60 * 60;
        if clock.unix_timestamp <= loan.next_payment_due + default_threshold_seconds {
            return Err(ErrorCode::NotInDefaultYet.into());
        }
        
        // Update loan status
        loan.status = LoanStatus::Default;
        
        // Emit event
        emit!(LoanDefaultEvent {
            loan_id: loan.loan_id.clone(),
            days_overdue: ((clock.unix_timestamp - loan.next_payment_due) / (24 * 60 * 60)) as u16,
            remaining_principal: loan.remaining_principal,
            timestamp: clock.unix_timestamp,
        });
        
        Ok(())
    }

    /// Close a completed loan
    pub fn close_loan(
        ctx: Context<CloseLoan>,
        _loan_id: String, // For logging only
    ) -> Result<()> {
        let loan = &ctx.accounts.loan;
        let clock = Clock::get()?;
        
        // Verify loan is in the correct state
        if loan.status != LoanStatus::Completed {
            return Err(ErrorCode::InvalidLoanStatus.into());
        }
        
        // Emit event
        emit!(LoanClosedEvent {
            loan_id: loan.loan_id.clone(),
            borrower: loan.borrower,
            timestamp: clock.unix_timestamp,
        });
        
        // Note: The account will be closed and lamports returned in the account validation
        
        Ok(())
    }

    /// Cancel a loan before funding
    pub fn cancel_loan(
        ctx: Context<CancelLoan>,
        _loan_id: String, // For logging only
    ) -> Result<()> {
        let loan = &mut ctx.accounts.loan;
        let clock = Clock::get()?;
        
        // Verify loan is in the correct state
        if loan.status != LoanStatus::Pending && loan.status != LoanStatus::Approved {
            return Err(ErrorCode::InvalidLoanStatus.into());
        }
        
        // Update loan status
        loan.status = LoanStatus::Cancelled;
        
        // Emit event
        emit!(LoanCancelledEvent {
            loan_id: loan.loan_id.clone(),
            canceller: ctx.accounts.authority.key(),
            timestamp: clock.unix_timestamp,
        });
        
        Ok(())
    }

    /// Update platform configuration
    pub fn update_platform_config(
        ctx: Context<UpdatePlatformConfig>,
        max_ltv: u16,
        min_loan_amount: u64,
        max_loan_amount: u64,
        origination_fee: u16,
        servicing_fee: u16,
        min_interest_rate: u16,
        default_interest_rate: u16,
        late_fee_rate: u16,
        grace_period_days: u8,
    ) -> Result<()> {
        let config = &mut ctx.accounts.platform_config;
        
        // Update configuration parameters
        config.max_ltv = max_ltv;
        config.min_loan_amount = min_loan_amount;
        config.max_loan_amount = max_loan_amount;
        config.origination_fee = origination_fee;
        config.servicing_fee = servicing_fee;
        config.min_interest_rate = min_interest_rate;
        config.default_interest_rate = default_interest_rate;
        config.late_fee_rate = late_fee_rate;
        config.grace_period_days = grace_period_days;
        
        Ok(())
    }

    /// Emergency pause all platform operations
    pub fn emergency_pause(ctx: Context<EmergencyPause>) -> Result<()> {
        let config = &mut ctx.accounts.platform_config;
        config.paused = true;
        Ok(())
    }

    /// Emergency unpause platform operations
    pub fn emergency_unpause(ctx: Context<EmergencyPause>) -> Result<()> {
        let config = &mut ctx.accounts.platform_config;
        config.paused = false;
        Ok(())
    }
}

// Account structs for each instruction

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub treasury: SystemAccount<'info>,
    
    pub treasury_token_account: Account<'info, TokenAccount>,
    
    #[account(
        init,
        payer = authority,
        space = 8 + PlatformConfig::INIT_SPACE,
        seeds = [b"platform-config"],
        bump
    )]
    pub platform_config: Account<'info, PlatformConfig>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateLoan<'info> {
    #[account(mut)]
    pub borrower: Signer<'info>,
    
    #[account(
        constraint = borrower_account.wallet == borrower.key(),
        constraint = borrower_account.kyc_verified @ ErrorCode::KycRequired,
    )]
    pub borrower_account: Account<'info, Borrower>,
    
    #[account(
        constraint = !platform_config.paused @ ErrorCode::PlatformPaused,
    )]
    pub platform_config: Account<'info, PlatformConfig>,
    
    #[account(
        init,
        payer = borrower,
        space = 8 + Loan::INIT_SPACE,
        seeds = [b"loan", borrower.key().as_ref(), &borrower_account.active_loans.to_le_bytes()],
        bump
    )]
    pub loan: Account<'info, Loan>,
    
    #[account(
        init,
        payer = borrower,
        token::mint = usdc_mint,
        token::authority = loan,
        seeds = [b"vault", loan.key().as_ref()],
        bump
    )]
    pub vault: Account<'info, TokenAccount>,
    
    pub usdc_mint: Account<'info, token::Mint>,
    
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct ApproveLoan<'info> {
    #[account(
        constraint = platform_config.authority == *authority.key @ ErrorCode::UnauthorizedAccess,
        constraint = !platform_config.paused @ ErrorCode::PlatformPaused,
    )]
    pub authority: Signer<'info>,
    
    #[account(mut)]
    pub platform_config: Account<'info, PlatformConfig>,
    
    #[account(
        mut,
        constraint = loan.status == LoanStatus::Pending @ ErrorCode::InvalidLoanStatus,
    )]
    pub loan: Account<'info, Loan>,
}

#[derive(Accounts)]
pub struct FundLoan<'info> {
    #[account(mut)]
    pub lender: Signer<'info>,
    
    #[account(
        constraint = !platform_config.paused @ ErrorCode::PlatformPaused,
    )]
    pub platform_config: Account<'info, PlatformConfig>,
    
    #[account(
        mut,
        constraint = loan.status == LoanStatus::Approved @ ErrorCode::InvalidLoanStatus,
    )]
    pub loan: Account<'info, Loan>,
    
    #[account(
        mut,
        constraint = lender_token_account.owner == lender.key(),
    )]
    pub lender_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = treasury_token_account.key() == platform_config.treasury_token_account,
    )]
    pub treasury_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = borrower_token_account.owner == loan.borrower,
    )]
    pub borrower_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct MakePayment<'info> {
    #[account(mut)]
    pub borrower: Signer<'info>,
    
    #[account(
        constraint = !platform_config.paused @ ErrorCode::PlatformPaused,
    )]
    pub platform_config: Account<'info, PlatformConfig>,
    
    #[account(
        mut,
        constraint = loan.borrower == borrower.key() @ ErrorCode::UnauthorizedAccess,
        constraint = (loan.status == LoanStatus::Active || loan.status == LoanStatus::Delinquent) @ ErrorCode::InvalidLoanStatus,
    )]
    pub loan: Account<'info, Loan>,
    
    #[account(
        mut,
        constraint = borrower_token_account.owner == borrower.key(),
    )]
    pub borrower_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = lender_token_account.owner == loan.lender,
    )]
    pub lender_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = treasury_token_account.key() == platform_config.treasury_token_account,
    )]
    pub treasury_token_account: Account<'info, TokenAccount>,
    
    #[account(
        init,
        payer = borrower,
        space = 8 + Payment::INIT_SPACE,
        seeds = [b"payment", loan.key().as_ref(), &payment_counter.count.checked_add(1).unwrap().to_le_bytes()],
        bump
    )]
    pub payment: Account<'info, Payment>,
    
    #[account(
        mut,
        seeds = [b"payment-counter", loan.key().as_ref()],
        bump,
    )]
    pub payment_counter: Account<'info, PaymentCounter>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct MarkLoanDelinquent<'info> {
    #[account(
        constraint = platform_config.authority == *authority.key @ ErrorCode::UnauthorizedAccess,
        constraint = !platform_config.paused @ ErrorCode::PlatformPaused,
    )]
    pub authority: Signer<'info>,
    
    pub platform_config: Account<'info, PlatformConfig>,
    
    #[account(
        mut,
        constraint = loan.status == LoanStatus::Active @ ErrorCode::InvalidLoanStatus,
    )]
    pub loan: Account<'info, Loan>,
}

#[derive(Accounts)]
pub struct MarkLoanDefault<'info> {
    #[account(
        constraint = platform_config.authority == *authority.key @ ErrorCode::UnauthorizedAccess,
        constraint = !platform_config.paused @ ErrorCode::PlatformPaused,
    )]
    pub authority: Signer<'info>,
    
    pub platform_config: Account<'info, PlatformConfig>,
    
    #[account(
        mut,
        constraint = loan.status == LoanStatus::Delinquent @ ErrorCode::InvalidLoanStatus,
    )]
    pub loan: Account<'info, Loan>,
}

#[derive(Accounts)]
pub struct CloseLoan<'info> {
    #[account(
        constraint = loan.borrower == *borrower.key @ ErrorCode::UnauthorizedAccess,
    )]
    pub borrower: Signer<'info>,
    
    #[account(
        mut,
        constraint = loan.status == LoanStatus::Completed @ ErrorCode::InvalidLoanStatus,
        close = borrower
    )]
    pub loan: Account<'info, Loan>,
}

#[derive(Accounts)]
pub struct CancelLoan<'info> {
    #[account(
        constraint = (loan.borrower == *authority.key || platform_config.authority == *authority.key) @ ErrorCode::UnauthorizedAccess,
    )]
    pub authority: Signer<'info>,
    
    pub platform_config: Account<'info, PlatformConfig>,
    
    #[account(
        mut,
        constraint = (loan.status == LoanStatus::Pending || loan.status == LoanStatus::Approved) @ ErrorCode::InvalidLoanStatus,
        close = authority
    )]
    pub loan: Account<'info, Loan>,
}

#[derive(Accounts)]
pub struct UpdatePlatformConfig<'info> {
    #[account(
        constraint = platform_config.authority == *authority.key @ ErrorCode::UnauthorizedAccess,
    )]
    pub authority: Signer<'info>,
    
    #[account(mut)]
    pub platform_config: Account<'info, PlatformConfig>,
}

#[derive(Accounts)]
pub struct EmergencyPause<'info> {
    #[account(
        constraint = platform_config.authority == *authority.key @ ErrorCode::UnauthorizedAccess,
    )]
    pub authority: Signer<'info>,
    
    #[account(mut)]
    pub platform_config: Account<'info, PlatformConfig>,
}

// State account definitions

#[account]
pub struct PlatformConfig {
    pub authority: Pubkey,        // Admin authority
    pub treasury: Pubkey,         // Treasury wallet for fees
    pub max_ltv: u16,             // Maximum LTV in basis points (9000 = 90%)
    pub min_loan_amount: u64,     // Minimum loan size
    pub max_loan_amount: u64,     // Maximum loan size
    pub origination_fee: u16,     // Default origination fee in basis points
    pub servicing_fee: u16,       // Servicing fee in basis points
    pub min_interest_rate: u16,   // Minimum interest rate in basis points
    pub default_interest_rate: u16, // Default interest rate in basis points
    pub late_fee_rate: u16,       // Late fee in basis points
    pub grace_period_days: u8,    // Payment grace period in days
    pub treasury_token_account: Pubkey, // USDC account for fees
    pub paused: bool,             // Emergency pause switch
}

impl PlatformConfig {
    pub const INIT_SPACE: usize = 
        32 +  // authority: Pubkey
        32 +  // treasury: Pubkey
        2 +   // max_ltv: u16
        8 +   // min_loan_amount: u64
        8 +   // max_loan_amount: u64
        2 +   // origination_fee: u16
        2 +   // servicing_fee: u16
        2 +   // min_interest_rate: u16
        2 +   // default_interest_rate: u16
        2 +   // late_fee_rate: u16
        1 +   // grace_period_days: u8
        32 +  // treasury_token_account: Pubkey
        1;    // paused: bool
}

#[account]
pub struct Loan {
    // Metadata
    pub loan_id: String,          // Unique identifier
    pub creation_timestamp: i64,  // Unix timestamp
    pub status: LoanStatus,       // Enum for loan status
    
    // Parties
    pub borrower: Pubkey,         // Borrower's wallet address
    pub lender: Pubkey,           // Lender's wallet address (platform initially)
    
    // Property & Collateral
    pub property_id: String,      // Reference to property in off-chain DB
    pub property_value: u64,      // Assessed value in USD cents
    pub ltv_ratio: u16,           // LTV in basis points (e.g., 9000 = 90%)
    pub collateral_type: CollateralType, // Enum for collateral type
    
    // Loan Terms
    pub principal_amount: u64,    // Loan amount in USDC (in smallest units)
    pub interest_rate: u16,       // Annual interest rate in basis points
    pub term_months: u8,          // Loan duration in months
    pub payment_frequency: PaymentFrequency, // Enum for payment schedule
    pub origination_fee: u16,     // Fee in basis points
    
    // Payment Tracking
    pub next_payment_due: i64,    // Unix timestamp
    pub total_payments_made: u64, // Total amount paid to date
    pub remaining_principal: u64, // Outstanding principal
    
    // Legal & Compliance
    pub legal_doc_hash: [u8; 32], // Hash of legal documentation
    pub ucc_filing_reference: String, // Reference to UCC filing
    pub kyc_verified: bool,       // KYC verification status
    
    // Additional
    pub bumps: LoanBumps,         // PDAs bump seeds
}

impl Loan {
    pub const INIT_SPACE: usize = 
        36 +  // loan_id: String (max 32 chars)
        8 +   // creation_timestamp: i64
        1 +   // status: LoanStatus (enum)
        32 +  // borrower: Pubkey
        32 +  // lender: Pubkey
        36 +  // property_id: String (max 32 chars)
        8 +   // property_value: u64
        2 +   // ltv_ratio: u16
        1 +   // collateral_type: CollateralType (enum)
        8 +   // principal_amount: u64
        2 +   // interest_rate: u16
        1 +   // term_months: u8
        1 +   // payment_frequency: PaymentFrequency (enum)
        2 +   // origination_fee: u16
        8 +   // next_payment_due: i64
        8 +   // total_payments_made: u64
        8 +   // remaining_principal: u64
        32 +  // legal_doc_hash: [u8; 32]
        36 +  // ucc_filing_reference: String (max 32 chars)
        1 +   // kyc_verified: bool
        2;    // bumps: LoanBumps (2 u8s)
}

#[account]
pub struct Payment {
    pub loan: Pubkey,              // Reference to loan account
    pub payment_number: u16,       // Sequential payment number
    pub timestamp: i64,            // When payment was made
    pub amount: u64,               // Total payment amount
    pub principal_portion: u64,    // Portion applied to principal
    pub interest_portion: u64,     // Portion applied to interest
    pub fees_portion: u64,         // Portion applied to fees
    pub status: PaymentStatus,     // Payment status
    pub transaction_signature: [u8; 64], // Solana transaction signature
}

impl Payment {
    pub const INIT_SPACE: usize = 
        32 +  // loan: Pubkey
        2 +   // payment_number: u16
        8 +   // timestamp: i64
        8 +   // amount: u64
        8 +   // principal_portion: u64
        8 +   // interest_portion: u64
        8 +   // fees_portion: u64
        1 +   // status: PaymentStatus (enum)
        64;   // transaction_signature: [u8; 64]
}

#[account]
pub struct PaymentCounter {
    pub count: u16,
}

#[account]
pub struct Borrower {
    pub wallet: Pubkey,           // Borrower's wallet address
    pub entity_type: u8,          // Type of entity
    pub kyc_verified: bool,       // KYC verification status
    pub kyc_timestamp: i64,       // When KYC was completed
    pub active_loans: u16,        // Number of active loans
    pub total_borrowed: u64,      // Total amount borrowed
    pub risk_score: u16,          // Internal risk score
}

// Enums and Structs

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum LoanStatus {
    Pending,    // Application submitted, not yet approved
    Approved,   // Approved but not funded
    Active,     // Funded and in good standing
    Delinquent, // Payment(s) overdue
    Default,    // In default status
    Completed,  // Fully repaid
    Cancelled,  // Cancelled before funding
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum CollateralType {
    BusinessAssets, // General business assets
    Equipment,      // Specific equipment
    Inventory,      // Inventory
    AccountsReceivable, // A/R
    Mixed,          // Multiple types
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum PaymentFrequency {
    Monthly,
    Quarterly,
    Semiannual,
    Annual,
    BulletPayment, // Single payment at end of term
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum PaymentStatus {
    Scheduled,  // Future payment
    Completed,  // Successfully processed
    Partial,    // Partial payment received
    Late,       // Received after due date
    Missed,     // Not received
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy)]
pub struct LoanBumps {
    pub loan_bump: u8,
    pub vault_bump: u8,
}

// Event definitions

#[event]
pub struct LoanCreatedEvent {
    pub loan_id: String,
    pub borrower: Pubkey,
    pub principal_amount: u64,
    pub property_id: String,
    pub timestamp: i64,
}

#[event]
pub struct LoanApprovedEvent {
    pub loan_id: String,
    pub approver: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct LoanFundedEvent {
    pub loan_id: String,
    pub borrower: Pubkey,
    pub lender: Pubkey,
    pub amount: u64,
    pub fees: u64,
    pub timestamp: i64,
}

#[event]
pub struct PaymentMadeEvent {
    pub loan_id: String,
    pub payment_number: u16,
    pub amount: u64,
    pub principal: u64,
    pub interest: u64,
    pub fees: u64,
    pub timestamp: i64,
}

#[event]
pub struct LoanDelinquentEvent {
    pub loan_id: String,
    pub days_overdue: u16,
    pub timestamp: i64,
}

#[event]
pub struct LoanDefaultEvent {
    pub loan_id: String,
    pub days_overdue: u16,
    pub remaining_principal: u64,
    pub timestamp: i64,
}

#[event]
pub struct LoanClosedEvent {
    pub loan_id: String,
    pub borrower: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct LoanCancelledEvent {
    pub loan_id: String,
    pub canceller: Pubkey,
    pub timestamp: i64,
}

// Error codes

#[error_code]
pub enum ErrorCode {
    #[msg("Platform is paused for maintenance or emergency")]
    PlatformPaused,
    
    #[msg("Loan amount exceeds maximum LTV ratio")]
    LtvExceeded,
    
    #[msg("Loan amount below minimum threshold")]
    LoanTooSmall,
    
    #[msg("Loan amount above maximum threshold")]
    LoanTooLarge,
    
    #[msg("KYC verification required")]
    KycRequired,
    
    #[msg("Property must be verified before loan approval")]
    PropertyVerificationRequired,
    
    #[msg("Insufficient funds in lender account")]
    InsufficientFunds,
    
    #[msg("Loan is not in the required status for this operation")]
    InvalidLoanStatus,
    
    #[msg("Payment amount is insufficient")]
    PaymentTooSmall,
    
    #[msg("Only the platform authority can perform this action")]
    UnauthorizedAccess,
    
    #[msg("Payment is not overdue yet")]
    PaymentNotOverdue,
    
    #[msg("Loan is not in default status yet")]
    NotInDefaultYet,
}
