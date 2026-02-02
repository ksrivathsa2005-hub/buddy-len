import { 
  Loan, 
  LoanCalculation, 
  LoanStatus, 
  DashboardSummary,
  TimelineEvent,
  Payment 
} from '@/types/loan';
import { 
  differenceInDays, 
  parseISO, 
  format, 
  isToday, 
  isBefore, 
  isAfter,
  addDays,
  startOfDay 
} from 'date-fns';

/**
 * Calculate the status of a loan based on dates and payments
 */
export function calculateLoanStatus(loan: Loan, totalPaid: number, totalPayable: number): LoanStatus {
  const today = startOfDay(new Date());
  const dueDate = startOfDay(parseISO(loan.dueDate));
  
  // If manually closed or fully paid
  if (loan.closedAt || totalPaid >= totalPayable) {
    return 'closed';
  }
  
  // Check if there are partial payments
  const hasPartialPayments = totalPaid > 0 && totalPaid < totalPayable;
  
  // Check date-based status
  if (isToday(dueDate)) {
    return 'due-today';
  }
  
  if (isAfter(today, dueDate)) {
    return hasPartialPayments ? 'partially-paid' : 'overdue';
  }
  
  // Before due date
  return hasPartialPayments ? 'partially-paid' : 'active';
}

/**
 * Calculate all financial details for a loan
 * 
 * INTEREST LOGIC:
 * - Within 30 days: Total Payable = Principal (X) + Fixed Interest (Y)
 * - After 30 days: Extra Interest = (Days Overdue) × (Y / 30)
 * - Final Payable = X + Y + Extra Interest
 */
export function calculateLoan(loan: Loan): LoanCalculation {
  const today = startOfDay(new Date());
  const startDate = startOfDay(parseISO(loan.startDate));
  const dueDate = startOfDay(parseISO(loan.dueDate));
  
  // Calculate days
  const daysActive = Math.max(0, differenceInDays(today, startDate));
  const daysOverdue = Math.max(0, differenceInDays(today, dueDate));
  
  // Interest calculations
  const baseInterest = loan.fixedInterest; // Y
  const dailyInterestRate = loan.fixedInterest / 30; // Y / 30
  
  // Extra interest only applies after due date
  const extraInterest = daysOverdue > 0 ? daysOverdue * dailyInterestRate : 0;
  
  const totalInterest = baseInterest + extraInterest;
  const totalPayable = loan.principal + totalInterest;
  
  // Sum up all payments
  const totalPaid = loan.payments.reduce((sum, payment) => sum + payment.amount, 0);
  const remainingBalance = Math.max(0, totalPayable - totalPaid);
  
  // Determine status
  const status = calculateLoanStatus(loan, totalPaid, totalPayable);
  
  return {
    loan,
    status,
    daysActive,
    daysOverdue,
    baseInterest,
    extraInterest,
    totalInterest,
    totalPayable,
    totalPaid,
    remainingBalance,
    dailyInterestRate,
  };
}

/**
 * Calculate dashboard summary from all loans
 */
export function calculateDashboardSummary(loans: Loan[]): DashboardSummary {
  const calculations = loans.map(calculateLoan);
  
  let totalMoneyLent = 0;
  let totalInterestExpected = 0;
  let totalInterestEarned = 0;
  let totalPending = 0;
  let activeLoans = 0;
  let overdueLoans = 0;
  let closedLoans = 0;
  
  for (const calc of calculations) {
    totalMoneyLent += calc.loan.principal;
    totalInterestExpected += calc.totalInterest;
    
    if (calc.status === 'closed') {
      closedLoans++;
      // Interest earned is the actual interest portion of what was paid
      const interestPaid = Math.min(calc.totalPaid - calc.loan.principal, calc.totalInterest);
      totalInterestEarned += Math.max(0, interestPaid);
    } else {
      totalPending += calc.remainingBalance;
      
      if (calc.status === 'overdue' || (calc.status === 'partially-paid' && calc.daysOverdue > 0)) {
        overdueLoans++;
      }
      
      if (calc.status === 'active' || calc.status === 'due-today' || calc.status === 'partially-paid') {
        activeLoans++;
      }
    }
  }
  
  return {
    totalMoneyLent,
    totalInterestExpected,
    totalInterestEarned,
    totalPending,
    activeLoans,
    overdueLoans,
    closedLoans,
    totalLoans: loans.length,
  };
}

/**
 * Generate timeline events for a loan's history
 */
export function generateLoanTimeline(loan: Loan): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  const calc = calculateLoan(loan);
  const today = startOfDay(new Date());
  const dueDate = startOfDay(parseISO(loan.dueDate));
  
  // Loan creation event
  events.push({
    id: `${loan.id}-created`,
    type: 'loan-created',
    date: loan.startDate,
    title: 'Loan Given',
    description: `Lent ${formatCurrency(loan.principal)} to ${loan.borrower.name}`,
    amount: loan.principal,
    isCompleted: true,
  });
  
  // Due date event
  const isDuePassed = isBefore(dueDate, today) || isToday(dueDate);
  events.push({
    id: `${loan.id}-due`,
    type: 'due-date',
    date: loan.dueDate,
    title: isDuePassed ? 'Due Date Passed' : 'Due Date',
    description: `Payment of ${formatCurrency(loan.principal + loan.fixedInterest)} due`,
    amount: loan.principal + loan.fixedInterest,
    isCompleted: isDuePassed,
  });
  
  // Payment events
  for (const payment of loan.payments) {
    events.push({
      id: payment.id,
      type: 'payment',
      date: payment.date,
      title: 'Payment Received',
      description: payment.notes || `Received ${formatCurrency(payment.amount)}`,
      amount: payment.amount,
      isCompleted: true,
    });
  }
  
  // Overdue event (if applicable)
  if (calc.daysOverdue > 0 && calc.status !== 'closed') {
    events.push({
      id: `${loan.id}-overdue`,
      type: 'overdue',
      date: loan.dueDate,
      title: 'Loan Overdue',
      description: `${calc.daysOverdue} days overdue. Extra interest: ${formatCurrency(calc.extraInterest)}`,
      amount: calc.extraInterest,
      isCompleted: true,
    });
  }
  
  // Closed event
  if (loan.closedAt || calc.status === 'closed') {
    events.push({
      id: `${loan.id}-closed`,
      type: 'closed',
      date: loan.closedAt || new Date().toISOString(),
      title: 'Loan Closed',
      description: `Total collected: ${formatCurrency(calc.totalPaid)}`,
      amount: calc.totalPaid,
      isCompleted: true,
    });
  }
  
  // Sort by date descending (most recent first)
  return events.sort((a, b) => 
    parseISO(b.date).getTime() - parseISO(a.date).getTime()
  );
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  return format(parseISO(dateString), 'dd MMM yyyy');
}

/**
 * Format date with relative info
 */
export function formatDateRelative(dateString: string): string {
  const date = parseISO(dateString);
  const today = new Date();
  const diffDays = differenceInDays(date, today);
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} days`;
  if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;
  
  return format(date, 'dd MMM yyyy');
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Calculate due date from start date (30 days later)
 */
export function calculateDueDate(startDate: string): string {
  return addDays(parseISO(startDate), 30).toISOString();
}
