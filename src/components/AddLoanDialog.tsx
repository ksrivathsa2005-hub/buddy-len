import { useState, useEffect } from 'react';
import { Loan } from '@/types/loan';
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

interface AddLoanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    borrower: { name: string; phone?: string };
    principal: number;
    fixedInterest: number;
    startDate: string;
    notes?: string;
  }) => void;
  editLoan?: Loan | null;
}

export function AddLoanDialog({ open, onOpenChange, onSubmit, editLoan }: AddLoanDialogProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [principal, setPrincipal] = useState('');
  const [fixedInterest, setFixedInterest] = useState('');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState('');

  // Reset or populate form when dialog opens
  useEffect(() => {
    if (open) {
      if (editLoan) {
        setName(editLoan.borrower.name);
        setPhone(editLoan.borrower.phone || '');
        setPrincipal(editLoan.principal.toString());
        setFixedInterest(editLoan.fixedInterest.toString());
        setStartDate(new Date(editLoan.startDate));
        setNotes(editLoan.notes || '');
      } else {
        setName('');
        setPhone('');
        setPrincipal('');
        setFixedInterest('');
        setStartDate(new Date());
        setNotes('');
      }
    }
  }, [open, editLoan]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const principalNum = parseFloat(principal);
    const interestNum = parseFloat(fixedInterest);

    if (!name.trim() || isNaN(principalNum) || principalNum <= 0 || isNaN(interestNum) || interestNum < 0) {
      return;
    }

    onSubmit({
      borrower: {
        name: name.trim(),
        phone: phone.trim() || undefined,
      },
      principal: principalNum,
      fixedInterest: interestNum,
      startDate: startDate.toISOString(),
      notes: notes.trim() || undefined,
    });

    onOpenChange(false);
  };

  const isValid = 
    name.trim() && 
    principal && 
    parseFloat(principal) > 0 && 
    fixedInterest && 
    parseFloat(fixedInterest) >= 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{editLoan ? 'Edit Loan' : 'Add New Loan'}</DialogTitle>
            <DialogDescription>
              {editLoan 
                ? 'Update the loan details below.' 
                : 'Enter the details of the loan you\'re giving.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Borrower Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">Borrower Name *</Label>
              <Input
                id="name"
                placeholder="Enter borrower's name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Phone */}
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Optional"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            {/* Principal Amount */}
            <div className="grid gap-2">
              <Label htmlFor="principal">Principal Amount (₹) *</Label>
              <Input
                id="principal"
                type="number"
                placeholder="10000"
                min="1"
                step="1"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                required
              />
            </div>

            {/* Fixed Interest */}
            <div className="grid gap-2">
              <Label htmlFor="interest">Fixed Interest for 30 Days (₹) *</Label>
              <Input
                id="interest"
                type="number"
                placeholder="500"
                min="0"
                step="1"
                value={fixedInterest}
                onChange={(e) => setFixedInterest(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Daily rate after 30 days: ₹{fixedInterest ? (parseFloat(fixedInterest) / 30).toFixed(2) : '0.00'}/day
              </p>
            </div>

            {/* Start Date */}
            <div className="grid gap-2">
              <Label>Loan Start Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Notes */}
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Why is this loan being given?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid}>
              {editLoan ? 'Save Changes' : 'Add Loan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
