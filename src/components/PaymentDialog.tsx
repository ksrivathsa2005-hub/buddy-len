import { useState } from 'react';
import { Loan } from '@/types/loan';
import { calculateLoan, formatCurrency } from '@/utils/loanCalculations';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (amount: number, date: string, notes?: string) => void;
  loan: Loan | null;
}

export function PaymentDialog({ open, onOpenChange, onSubmit, loan }: PaymentDialogProps) {
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState('');

  if (!loan) return null;

  const calc = calculateLoan(loan);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    onSubmit(amountNum, paymentDate.toISOString(), notes.trim() || undefined);

    // Reset form
    setAmount('');
    setPaymentDate(new Date());
    setNotes('');
    onOpenChange(false);
  };

  const handlePayFull = () => {
    setAmount(calc.remainingBalance.toString());
  };

  const isValid = amount && parseFloat(amount) > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Recording payment from {loan.borrower.name}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {/* Balance info */}
            <div className="bg-muted/50 rounded-lg p-3 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Payable</span>
                <span className="font-mono-numbers">{formatCurrency(calc.totalPayable)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Already Paid</span>
                <span className="font-mono-numbers text-status-active">{formatCurrency(calc.totalPaid)}</span>
              </div>
              <div className="flex justify-between font-medium pt-1 border-t border-border">
                <span>Remaining Balance</span>
                <span className="font-mono-numbers text-money-pending">{formatCurrency(calc.remainingBalance)}</span>
              </div>
            </div>

            {/* Payment Amount */}
            <div className="grid gap-2">
              <Label htmlFor="amount">Payment Amount (₹) *</Label>
              <div className="flex gap-2">
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  min="1"
                  step="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={handlePayFull}
                  disabled={calc.remainingBalance <= 0}
                >
                  Pay Full
                </Button>
              </div>
            </div>

            {/* Payment Date */}
            <div className="grid gap-2">
              <Label>Payment Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !paymentDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {paymentDate ? format(paymentDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={paymentDate}
                    onSelect={(date) => date && setPaymentDate(date)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Notes */}
            <div className="grid gap-2">
              <Label htmlFor="payment-notes">Notes</Label>
              <Textarea
                id="payment-notes"
                placeholder="Optional payment notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid}>
              Record Payment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
