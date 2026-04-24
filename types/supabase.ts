export type UserRole = "borrower" | "lender" | "both";
export type LoanStatus = "pending" | "approved" | "funding" | "funded" | "active" | "completed" | "defaulted" | "cancelled";
export type LoanPurpose = "personal" | "business" | "education" | "medical" | "home_improvement" | "debt_consolidation" | "other";
export type RiskTolerance = "conservative" | "moderate" | "aggressive";
export type TransactionType = "deposit" | "withdrawal" | "loan_disbursement" | "loan_repayment" | "interest_payment" | "fee" | "refund";

export interface Database {}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  created_at: string;
}

export interface Loan {
  id: string;
  borrower_id: string;
  title: string;
  description?: string;
  amount: number;
  funded_amount: number;
  interest_rate: number;
  term_months: number;
  purpose: LoanPurpose;
  status: LoanStatus;
  risk_grade?: string;
  monthly_payment?: number;
  created_at: string;
}

export interface LoanFunding {
  id: string;
  loan_id: string;
  lender_id: string;
  amount: number;
  share_pct?: number;
  status: string;
  funded_at: string;
}