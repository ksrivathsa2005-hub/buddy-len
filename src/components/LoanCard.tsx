import { LoanCalculation } from '@/types/loan';
import { formatCurrency, formatDateRelative } from '@/utils/loanCalculations';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { User, Phone, Calendar, ChevronRight, CalendarPlus } from 'lucide-react';

interface LoanCardProps {
  calculation: LoanCalculation;
  onClick: () => void;
  onExtend?: (id: string) => void;
}

export function LoanCard({ calculation, onClick, onExtend }: LoanCardProps) {
  const { loan, status, remainingBalance, totalPayable, daysOverdue, extraInterest, totalPaid } = calculation;

  const paymentProgress = totalPayable > 0 ? (totalPaid / totalPayable) * 100 : 0;

  const cardGlow = {
    'active': '',
    'due-today': 'glow-due-today',
    'overdue': 'glow-overdue',
    'partially-paid': '',
    'closed': '',
  };

  const handleExtend = (e: React.MouseEvent) => {
    e.stopPropagation();
    onExtend?.(loan.id);
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
            
            {/* Extend button - only for non-closed loans */}
            {status !== 'closed' && onExtend && (
              <Button
                variant="outline"
                size="sm"
                className="mt-2 text-xs h-7 gap-1"
                onClick={handleExtend}
              >
                <CalendarPlus className="h-3 w-3" />
                Extend 30d
              </Button>
            )}
          </div>

          {/* Arrow indicator */}
          <ChevronRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-foreground transition-colors shrink-0" />
        </div>

        {/* Payment Progress Bar */}
        <div className="mt-4 space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Payment Progress</span>
            <span>{Math.round(paymentProgress)}% collected</span>
          </div>
          <Progress 
            value={paymentProgress} 
            className={cn(
              "h-2",
              status === 'closed' && "[&>div]:bg-status-active",
              status === 'overdue' && "[&>div]:bg-status-overdue",
              status === 'partially-paid' && "[&>div]:bg-status-partial",
              (status === 'active' || status === 'due-today') && "[&>div]:bg-primary"
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
