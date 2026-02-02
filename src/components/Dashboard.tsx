import { DashboardSummary } from '@/types/loan';
import { formatCurrency } from '@/utils/loanCalculations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Wallet, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  PiggyBank 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardProps {
  summary: DashboardSummary;
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: typeof Wallet;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
}

function StatCard({ title, value, subtitle, icon: Icon, variant = 'default', className }: StatCardProps) {
  const variantStyles = {
    default: 'border-border',
    success: 'border-status-active/30 bg-status-active-bg/30',
    warning: 'border-status-due-today/30 bg-status-due-today-bg/30',
    danger: 'border-status-overdue/30 bg-status-overdue-bg/30',
  };

  const iconStyles = {
    default: 'text-muted-foreground',
    success: 'text-status-active',
    warning: 'text-status-due-today',
    danger: 'text-status-overdue',
  };

  return (
    <Card className={cn('card-hover', variantStyles[variant], className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={cn('h-4 w-4', iconStyles[variant])} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold font-mono-numbers tracking-tight">
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function Dashboard({ summary }: DashboardProps) {
  return (
    <div className="space-y-6">
      {/* Main stats row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Money Lent"
          value={formatCurrency(summary.totalMoneyLent)}
          subtitle={`${summary.totalLoans} total loans`}
          icon={Wallet}
        />
        <StatCard
          title="Pending to Collect"
          value={formatCurrency(summary.totalPending)}
          subtitle={`${summary.activeLoans} active loans`}
          icon={Clock}
          variant={summary.totalPending > 0 ? 'warning' : 'default'}
        />
        <StatCard
          title="Interest Expected"
          value={formatCurrency(summary.totalInterestExpected)}
          subtitle="Including late fees"
          icon={TrendingUp}
        />
        <StatCard
          title="Interest Earned"
          value={formatCurrency(summary.totalInterestEarned)}
          subtitle={`From ${summary.closedLoans} closed loans`}
          icon={PiggyBank}
          variant={summary.totalInterestEarned > 0 ? 'success' : 'default'}
        />
      </div>

      {/* Loan status summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Active Loans"
          value={summary.activeLoans}
          icon={Clock}
          variant="default"
        />
        <StatCard
          title="Overdue Loans"
          value={summary.overdueLoans}
          icon={AlertTriangle}
          variant={summary.overdueLoans > 0 ? 'danger' : 'default'}
        />
        <StatCard
          title="Closed Loans"
          value={summary.closedLoans}
          icon={CheckCircle2}
          variant="success"
        />
      </div>
    </div>
  );
}
