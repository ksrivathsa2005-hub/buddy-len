import { LoanCalculation } from '@/types/loan';
import { formatCurrency, formatDateRelative } from '@/utils/loanCalculations';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { User, Phone, Calendar, ChevronRight } from 'lucide-react';

interface LoanCardProps {
  calculation: LoanCalculation;
  onClick: () => void;
}

export function LoanCard({ calculation, onClick }: LoanCardProps) {
  const { loan, status, remainingBalance, totalPayable, daysOverdue, extraInterest } = calculation;

  const cardGlow = {
    'active': '',
    'due-today': 'glow-due-today',
    'overdue': 'glow-overdue',
    'partially-paid': '',
    'closed': '',
  };

  return (
    <Card 
      className={cn(
        'card-hover cursor-pointer group',
        cardGlow[status],
        status === 'overdue' && 'border-status-overdue/50',
        status === 'due-today' && 'border-status-due-today/50'
      )}
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          {/* Left side - Borrower info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center shrink-0">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-foreground truncate">
                  {loan.borrower.name}
                </h3>
                {loan.borrower.phone && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {loan.borrower.phone}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>Due {formatDateRelative(loan.dueDate)}</span>
              </div>
              <StatusBadge status={status} />
            </div>

            {daysOverdue > 0 && status !== 'closed' && (
              <p className="text-xs text-status-overdue mt-2">
                {daysOverdue} days overdue • Extra interest: {formatCurrency(extraInterest)}
              </p>
            )}

            {loan.notes && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-1">
                {loan.notes}
              </p>
            )}
          </div>

          {/* Right side - Amount info */}
          <div className="text-right shrink-0">
            <div className="text-2xl font-bold font-mono-numbers text-foreground">
              {formatCurrency(loan.principal)}
            </div>
            <div className="text-sm text-muted-foreground">
              +{formatCurrency(calculation.totalInterest)} interest
            </div>
            {status !== 'closed' && remainingBalance < totalPayable && (
              <div className="text-sm font-medium text-status-partial mt-1">
                {formatCurrency(remainingBalance)} remaining
              </div>
            )}
            {status === 'closed' && (
              <div className="text-sm font-medium text-status-active mt-1">
                Fully collected
              </div>
            )}
          </div>

          {/* Arrow indicator */}
          <ChevronRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-foreground transition-colors shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
}
