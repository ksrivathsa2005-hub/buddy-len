import { useState, useEffect, useCallback } from 'react';
import { Loan, Payment } from '@/types/loan';
import { generateId, calculateDueDate } from '@/utils/loanCalculations';

const STORAGE_KEY = 'loan-ledger-data';

interface UseLoanReturn {
  loans: Loan[];
  addLoan: (data: Omit<Loan, 'id' | 'payments' | 'createdAt' | 'updatedAt' | 'dueDate'>) => Loan;
  updateLoan: (id: string, data: Partial<Loan>) => void;
  deleteLoan: (id: string) => void;
  extendLoan: (id: string) => void;
  closeLoan: (id: string) => void;
  addPayment: (loanId: string, amount: number, date: string, notes?: string) => Payment;
  deletePayment: (loanId: string, paymentId: string) => void;
  getLoan: (id: string) => Loan | undefined;
  isLoading: boolean;
}

export function useLoans(): UseLoanReturn {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setLoans(parsed);
      }
    } catch (error) {
      console.error('Failed to load loans from storage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save to localStorage whenever loans change
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(loans));
      } catch (error) {
        console.error('Failed to save loans to storage:', error);
      }
    }
  }, [loans, isLoading]);

  const addLoan = useCallback((data: Omit<Loan, 'id' | 'payments' | 'createdAt' | 'updatedAt' | 'dueDate'>): Loan => {
    const now = new Date().toISOString();
    const newLoan: Loan = {
      ...data,
      id: generateId(),
      dueDate: calculateDueDate(data.startDate),
      payments: [],
      createdAt: now,
      updatedAt: now,
    };
    
    setLoans(prev => [newLoan, ...prev]);
    return newLoan;
  }, []);

  const updateLoan = useCallback((id: string, data: Partial<Loan>) => {
    setLoans(prev => prev.map(loan => {
      if (loan.id !== id) return loan;
      
      const updated = {
        ...loan,
        ...data,
        updatedAt: new Date().toISOString(),
      };
      
      // Recalculate due date if start date changed
      if (data.startDate && data.startDate !== loan.startDate) {
        updated.dueDate = calculateDueDate(data.startDate);
      }
      
      return updated;
    }));
  }, []);

  const deleteLoan = useCallback((id: string) => {
    setLoans(prev => prev.filter(loan => loan.id !== id));
  }, []);

  const extendLoan = useCallback((id: string) => {
    setLoans(prev => prev.map(loan => {
      if (loan.id !== id) return loan;
      const currentDueDate = new Date(loan.dueDate);
      const newDueDate = new Date(currentDueDate);
      newDueDate.setDate(newDueDate.getDate() + 30);
      return {
        ...loan,
        dueDate: newDueDate.toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }));
  }, []);

  const closeLoan = useCallback((id: string) => {
    setLoans(prev => prev.map(loan => {
      if (loan.id !== id) return loan;
      return {
        ...loan,
        closedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }));
  }, []);

  const addPayment = useCallback((loanId: string, amount: number, date: string, notes?: string): Payment => {
    const payment: Payment = {
      id: generateId(),
      loanId,
      amount,
      date,
      notes,
      createdAt: new Date().toISOString(),
    };

    setLoans(prev => prev.map(loan => {
      if (loan.id !== loanId) return loan;
      return {
        ...loan,
        payments: [...loan.payments, payment],
        updatedAt: new Date().toISOString(),
      };
    }));

    return payment;
  }, []);

  const deletePayment = useCallback((loanId: string, paymentId: string) => {
    setLoans(prev => prev.map(loan => {
      if (loan.id !== loanId) return loan;
      return {
        ...loan,
        payments: loan.payments.filter(p => p.id !== paymentId),
        updatedAt: new Date().toISOString(),
      };
    }));
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
  };
}
