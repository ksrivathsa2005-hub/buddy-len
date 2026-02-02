import { supabase } from './supabase';
import { Loan, Payment } from '@/types/loan';

export const loansApi = {
  // Get all loans - SIMPLE query first
  async getAll() {
    try {
      console.log('Fetching loans from Supabase...');
      const { data, error } = await supabase
        .from('loans')
        .select('*');
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Loans fetched:', data);
      return data || [];
    } catch (err) {
      console.error('API Error:', err);
      throw err;
    }
  },

  // Get single loan
  async getById(id: string) {
    try {
      const { data, error } = await supabase
        .from('loans')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('API Error in getById:', err);
      throw err;
    }
  },

  // Create loan
  async create(loan: Omit<Loan, 'id' | 'payments' | 'createdAt' | 'updatedAt'>) {
    try {
      const { data, error } = await supabase
        .from('loans')
        .insert([{
          borrower: loan.borrower,
          principal: loan.principal,
          fixed_interest: loan.fixedInterest,
          start_date: loan.startDate,
          due_date: loan.dueDate,
          notes: loan.notes || null,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return { ...data, payments: [] };
    } catch (err) {
      console.error('API Error in create:', err);
      throw err;
    }
  },

  // Update loan
  async update(id: string, updates: Partial<Loan>) {
    try {
      const dbUpdates: any = {};
      
      if (updates.borrower) dbUpdates.borrower = updates.borrower;
      if (updates.principal !== undefined) dbUpdates.principal = updates.principal;
      if (updates.fixedInterest !== undefined) dbUpdates.fixed_interest = updates.fixedInterest;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
      if (updates.closedAt !== undefined) dbUpdates.closed_at = updates.closedAt;
      if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;
      
      const { data, error } = await supabase
        .from('loans')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return { ...data, payments: [] };
    } catch (err) {
      console.error('API Error in update:', err);
      throw err;
    }
  },

  // Delete loan
  async delete(id: string) {
    const { error } = await supabase
      .from('loans')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Add payment
  async addPayment(loanId: string, payment: Omit<Payment, 'id' | 'createdAt'>) {
    const { data, error } = await supabase
      .from('payments')
      .insert([{
        loan_id: loanId,
        amount: payment.amount,
        date: payment.date,
        notes: payment.notes || null,
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data as any;
  },

  // Delete payment
  async deletePayment(paymentId: string) {
    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', paymentId);
    
    if (error) throw error;
  },
};
