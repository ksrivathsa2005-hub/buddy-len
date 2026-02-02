import { LoanStatus } from '@/types/loan';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CheckCircle2, Clock, AlertTriangle, XCircle, CircleDot } from 'lucide-react';

interface StatusBadgeProps {
  status: LoanStatus;
  className?: string;
  showIcon?: boolean;
}

const statusConfig: Record<LoanStatus, {
  label: string;
  icon: typeof Clock;
  className: string;
}> = {
  active: {
    label: 'Active',
    icon: Clock,
    className: 'bg-status-active-bg text-status-active border-status-active/30',
  },
  'due-today': {
    label: 'Due Today',
    icon: AlertTriangle,
    className: 'bg-status-due-today-bg text-status-due-today border-status-due-today/30 animate-pulse-soft',
  },
  overdue: {
    label: 'Overdue',
    icon: XCircle,
    className: 'bg-status-overdue-bg text-status-overdue border-status-overdue/30',
  },
  'partially-paid': {
    label: 'Partial',
    icon: CircleDot,
    className: 'bg-status-partial-bg text-status-partial border-status-partial/30',
  },
  closed: {
    label: 'Closed',
    icon: CheckCircle2,
    className: 'bg-status-closed-bg text-status-closed border-status-closed/30',
  },
};

export function StatusBadge({ status, className, showIcon = true }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge 
      variant="outline" 
      className={cn(
        'font-medium border px-2.5 py-0.5 text-xs',
        config.className,
        className
      )}
    >
      {showIcon && <Icon className="mr-1 h-3 w-3" />}
      {config.label}
    </Badge>
  );
}
