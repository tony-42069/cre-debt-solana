//! # Loan Amortization Utilities
//!
//! **Version:** 1.0.0
//! **Description:** Proper loan amortization calculations for CRE-Debt-Solana
//!
//! ## Features
//! - Standard amortization formula implementation
//! - Amortization schedule generation
//! - Interest/principal portion calculations
//! - Balloon payment support
//! - Payment date tracking

use anchor_lang::prelude::*;

/// Calculate monthly payment using standard amortization formula
/// P = M * [r(1+r)^n] / [(1+r)^n - 1]
/// Where:
///   P = Monthly payment
///   M = Principal (loan amount)
///   r = Monthly interest rate (annual rate / 12)
///   n = Number of payments (term in months)
pub fn calculate_monthly_payment(
    principal: u64,
    annual_rate_bps: u16,
    term_months: u8,
) -> u64 {
    if term_months == 0 || principal == 0 {
        return principal;
    }

    let annual_rate = annual_rate_bps as f64 / 10000.0;
    let monthly_rate = annual_rate / 12.0;
    let term_months_f64 = term_months as f64;

    if monthly_rate <= 0.0 {
        return principal / term_months as u64;
    }

    let payment = principal as f64
        * (monthly_rate * (1.0 + monthly_rate).powf(term_months_f64))
        / ((1.0 + monthly_rate).powf(term_months_f64) - 1.0);

    payment as u64
}

/// Calculate total interest over the life of the loan
pub fn calculate_total_interest(
    principal: u64,
    annual_rate_bps: u16,
    term_months: u8,
) -> u64 {
    let monthly_payment = calculate_monthly_payment(principal, annual_rate_bps, term_months);
    let total_paid = monthly_payment as u128 * term_months as u128;
    let principal_u128 = principal as u128;

    if total_paid > principal_u128 {
        (total_paid - principal_u128) as u64
    } else {
        0
    }
}

/// Calculate interest portion of a specific payment
/// Interest = Outstanding Principal * Monthly Interest Rate
pub fn calculate_interest_portion(
    outstanding_principal: u64,
    annual_rate_bps: u16,
    payment_amount: u64,
) -> u64 {
    let monthly_rate = (annual_rate_bps as f64) / 10000.0 / 12.0;
    let interest = (outstanding_principal as f64 * monthly_rate) as u64;
    interest.min(payment_amount)
}

/// Calculate principal portion of a payment
/// Principal = Payment - Interest
pub fn calculate_principal_portion(
    payment_amount: u64,
    interest_portion: u64,
) -> u64 {
    payment_amount.saturating_sub(interest_portion)
}

/// Generate amortization schedule entry
#[derive(Debug, Clone)]
pub struct AmortizationEntry {
    pub payment_number: u16,
    pub payment_amount: u64,
    pub principal_portion: u64,
    pub interest_portion: u64,
    pub outstanding_balance: u64,
    pub is_balloon: bool,
}

/// Generate complete amortization schedule
pub fn generate_amortization_schedule(
    principal: u64,
    annual_rate_bps: u16,
    term_months: u8,
    balloon_payment: u64,
) -> Vec<AmortizationEntry> {
    let mut schedule: Vec<AmortizationEntry> = Vec::new();
    let mut balance = principal;
    let monthly_payment = calculate_monthly_payment(principal, annual_rate_bps, term_months);

    for month in 1..=term_months as u16 {
        let interest = calculate_interest_portion(balance, annual_rate_bps, monthly_payment);

        let is_last_payment = month == term_months as u16;
        let is_balloon_payment = balloon_payment > 0 && is_last_payment;

        let mut principal_portion = calculate_principal_portion(monthly_payment, interest);

        if is_balloon_payment {
            principal_portion = balance.saturating_sub(balloon_payment);
        }

        let payment_amount = if is_balloon_payment {
            principal_portion + interest + balloon_payment
        } else {
            monthly_payment
        };

        balance = balance.saturating_sub(principal_portion);

        schedule.push(AmortizationEntry {
            payment_number: month,
            payment_amount,
            principal_portion,
            interest_portion: interest,
            outstanding_balance: balance,
            is_balloon: is_balloon_payment,
        });

        if balance == 0 {
            break;
        }
    }

    schedule
}

/// Calculate remaining balance after n payments
pub fn calculate_remaining_balance(
    principal: u64,
    annual_rate_bps: u16,
    term_months: u8,
    payments_made: u16,
) -> u64 {
    if payments_made >= term_months as u16 {
        return 0;
    }

    let schedule = generate_amortization_schedule(principal, annual_rate_bps, term_months, 0);

    if let Some(entry) = schedule.get(payments_made as usize) {
        entry.outstanding_balance
    } else {
        0
    }
}

/// Calculate payoff amount including accrued interest
pub fn calculate_payoff_amount(
    principal: u64,
    annual_rate_bps: u16,
    term_months: u8,
    payments_made: u16,
    days_since_last_payment: u16,
) -> u64 {
    let remaining_balance = calculate_remaining_balance(
        principal,
        annual_rate_bps,
        term_months,
        payments_made,
    );

    let daily_rate = (annual_rate_bps as f64) / 10000.0 / 365.0;
    let accrued_interest = (remaining_balance as f64 * daily_rate * days_since_last_payment as f64) as u64;

    remaining_balance.saturating_add(accrued_interest)
}

/// Determine if a payment is late
pub fn is_payment_late(
    next_payment_due: i64,
    current_time: i64,
    grace_period_days: u8,
) -> bool {
    let grace_period_seconds = grace_period_days as i64 * 24 * 60 * 60;
    current_time > next_payment_due + grace_period_seconds
}

/// Calculate late fee
pub fn calculate_late_fee(
    payment_amount: u64,
    late_fee_rate_bps: u16,
    max_late_fee: u64,
) -> u64 {
    let late_fee = (payment_amount as u128 * late_fee_rate_bps as u128 / 10000) as u64;
    late_fee.min(max_late_fee)
}

/// Validate amortization parameters
pub fn validate_amortization_params(
    principal: u64,
    annual_rate_bps: u16,
    term_months: u8,
    balloon_payment: u64,
    max_term_months: u8,
) -> Result<()> {
    require!(principal > 0, ErrorCode::InvalidLoanAmount);
    require!(term_months > 0, ErrorCode::InvalidLoanTerm);
    require!(term_months <= max_term_months, ErrorCode::LoanTermExceedsMaximum);
    require!(
        annual_rate_bps >= 0 && annual_rate_bps <= 2000,
        ErrorCode::InterestRateOutOfRange
    );
    require!(balloon_payment <= principal, ErrorCode::BalloonPaymentExceedsPrincipal);
    Ok(())
}

/// Custom error codes for amortization
#[error_code]
pub enum AmortizationError {
    #[msg("Invalid loan amount")]
    InvalidLoanAmount,

    #[msg("Invalid loan term")]
    InvalidLoanTerm,

    #[msg("Loan term exceeds maximum allowed")]
    LoanTermExceedsMaximum,

    #[msg("Interest rate out of valid range (0-20%)")]
    InterestRateOutOfRange,

    #[msg("Balloon payment exceeds principal")]
    BalloonPaymentExceedsPrincipal,
}
