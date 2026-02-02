import { useState, useEffect, useCallback } from 'react';
import { Loan, Payment } from '@/types/loan';
import { generateId, calculateDueDate } from '@/utils/loanCalculations';
import { loansApi } from '@/lib/api';

interface UseLoanReturn {
  loans: Loan[];
  addLoan: (data: Omit<Loan, 'id' | 'payments' | 'createdAt' | 'updatedAt' | 'dueDate'>) => Promise<Loan>;
  updateLoan: (id: string, data: Partial<Loan>) => Promise<void>;
  deleteLoan: (id: string) => Promise<void>;
  extendLoan: (id: string) => Promise<void>;
  closeLoan: (id: string) => Promise<void>;
  addPayment: (loanId: string, amount: number, date: string, notes?: string) => Promise<Payment>;
  deletePayment: (loanId: string, paymentId: string) => Promise<void>;
  getLoan: (id: string) => Loan | undefined;
  isLoading: boolean;
  error: string | null;
}

export function useLoans(): UseLoanReturn {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load from database on mount
  useEffect(() => {
    const loadLoans = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await loansApi.getAll();
        setLoans(data.map(convertFromDb));
      } catch (err) {
        console.error('Failed to load loans from database:', err);
        setError(err instanceof Error ? err.message : 'Failed to load loans');
      } finally {
        setIsLoading(false);
      }
    };

    loadLoans();
  }, []);

  const addLoan = useCallback(async (data: Omit<Loan, 'id' | 'payments' | 'createdAt' | 'updatedAt' | 'dueDate'>): Promise<Loan> => {
    try {
      const dbLoan = await loansApi.create({
        ...data,
        dueDate: calculateDueDate(data.startDate),
      });
      const newLoan = convertFromDb(dbLoan);
      setLoans(prev => [newLoan, ...prev]);
      return newLoan;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add loan');
      throw err;
    }
  }, []);

  const updateLoan = useCallback(async (id: string, data: Partial<Loan>) => {
    try {
      const dbLoan = await loansApi.update(id, data);
      setLoans(prev => prev.map(loan => loan.id === id ? convertFromDb(dbLoan) : loan));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update loan');
      throw err;
    }
  }, []);

  const deleteLoan = useCallback(async (id: string) => {
    try {
      await loansApi.delete(id);
      setLoans(prev => prev.filter(loan => loan.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete loan');
      throw err;
    }
  }, []);

  const extendLoan = useCallback(async (id: string) => {
    try {
      const loan = loans.find(l => l.id === id);
      if (!loan) return;
      
      const currentDueDate = new Date(loan.dueDate);
      const newDueDate = new Date(currentDueDate);
      newDueDate.setDate(newDueDate.getDate() + 30);
      
      const dbLoan = await loansApi.update(id, { dueDate: newDueDate.toISOString() });
      setLoans(prev => prev.map(l => l.id === id ? convertFromDb(dbLoan) : l));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extend loan');
      throw err;
    }
  }, [loans]);

  const closeLoan = useCallback(async (id: string) => {
    try {
      const dbLoan = await loansApi.update(id, { closedAt: new Date().toISOString() });
      setLoans(prev => prev.map(l => l.id === id ? convertFromDb(dbLoan) : l));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to close loan');
      throw err;
    }
  }, []);

  const addPayment = useCallback(async (loanId: string, amount: number, date: string, notes?: string): Promise<Payment> => {
    try {
      const dbPayment = await loansApi.addPayment(loanId, {
        loanId,
        amount,
        date,
        notes,
      });
      
      const payment = convertPaymentFromDb(dbPayment);
      
      // Update the local loan's payments
      setLoans(prev => prev.map(loan => {
        if (loan.id !== loanId) return loan;
        return {
          ...loan,
          payments: [...loan.payments, payment],
        };
      }));

      return payment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add payment');
      throw err;
    }
  }, []);

  const deletePayment = useCallback(async (loanId: string, paymentId: string) => {
    try {
      await loansApi.deletePayment(paymentId);
      setLoans(prev => prev.map(loan => {
        if (loan.id !== loanId) return loan;
        return {
          ...loan,
          payments: loan.payments.filter(p => p.id !== paymentId),
        };
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete payment');
      throw err;
    }
  }, []);

  const getLoan = useCallback((id: string): Loan | undefined => {
    return loans.find(loan => loan.id === id);
  }, [loans]);

  return {
    loans,
    addLoan,
    updateLoan,
    deleteLoan,
    extendLoan,
    closeLoan,
    addPayment,
    deletePayment,
    getLoan,
    isLoading,
    error,
  };
}

// Helper functions to convert between DB format (snake_case) and app format (camelCase)
function convertFromDb(dbLoan: any): Loan {
  return {
    id: dbLoan.id,
    borrower: dbLoan.borrower,
    principal: dbLoan.principal,
    fixedInterest: dbLoan.fixed_interest,
    startDate: dbLoan.start_date,
    dueDate: dbLoan.due_date,
    notes: dbLoan.notes,
    payments: (dbLoan.payments || []).map(convertPaymentFromDb),
    closedAt: dbLoan.closed_at,
    createdAt: dbLoan.created_at,
    updatedAt: dbLoan.updated_at,
  };
}

function convertPaymentFromDb(dbPayment: any): Payment {
  return {
    id: dbPayment.id,
    loanId: dbPayment.loan_id,
    amount: dbPayment.amount,
    date: dbPayment.date,
    notes: dbPayment.notes,
    createdAt: dbPayment.created_at,
  };
}
