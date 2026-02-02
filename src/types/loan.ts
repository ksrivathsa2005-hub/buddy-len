// Core types for the loan tracking system

export type LoanStatus = 'active' | 'due-today' | 'overdue' | 'partially-paid' | 'closed';

export interface Payment {
  id: string;
  loanId: string;
  amount: number;
  date: string; // ISO date string
  notes?: string;
  createdAt: string;
}

export interface Borrower {
  name: string;
  phone?: string;
}

export interface Loan {
  id: string;
  borrower: Borrower;
  principal: number; // X - the original amount lent
  fixedInterest: number; // Y - fixed interest for 30 days
  startDate: string; // ISO date string
  dueDate: string; // ISO date string (start + 30 days)
  notes?: string;
  payments: Payment[];
  closedAt?: string; // If manually closed
  createdAt: string;
  updatedAt: string;
}

// Calculated loan details (computed, not stored)
export interface LoanCalculation {
  loan: Loan;
  status: LoanStatus;
  daysActive: number;
  daysOverdue: number;
  baseInterest: number; // Y (the fixed interest)
  extraInterest: number; // Daily penalty after 30 days
  totalInterest: number; // baseInterest + extraInterest
  totalPayable: number; // principal + totalInterest
  totalPaid: number;
  remainingBalance: number;
  dailyInterestRate: number; // Y / 30
}

// Dashboard summary
export interface DashboardSummary {
  totalMoneyLent: number;
  totalInterestExpected: number;
  totalInterestEarned: number; // From closed loans
  totalPending: number; // Money yet to collect
  activeLoans: number;
  overdueLoans: number;
  closedLoans: number;
  totalLoans: number;
}

// Timeline event for loan history
export interface TimelineEvent {
  id: string;
  type: 'loan-created' | 'due-date' | 'payment' | 'overdue' | 'closed';
  date: string;
  title: string;
  description: string;
  amount?: number;
  isCompleted: boolean;
}
