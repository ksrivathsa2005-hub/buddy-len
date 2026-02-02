import { useState } from 'react';
import { Loan } from '@/types/loan';
import { 
  calculateLoan, 
  formatCurrency, 
  formatDate, 
  formatDateRelative,
  generateLoanTimeline 
} from '@/utils/loanCalculations';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Calendar, 
  FileText,
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  AlertTriangle,
  CreditCard,
  XCircle,
  Edit2
} from 'lucide-react';

interface LoanDetailProps {
  loan: Loan;
  onBack: () => void;
  onAddPayment: () => void;
  onEditLoan: () => void;
  onCloseLoan: () => void;
  onDeleteLoan: () => void;
  onDeletePayment: (paymentId: string) => void;
}

export function LoanDetail({ 
  loan, 
  onBack, 
  onAddPayment, 
  onEditLoan,
  onCloseLoan,
  onDeleteLoan,
  onDeletePayment 
}: LoanDetailProps) {
  const calc = calculateLoan(loan);
  const timeline = generateLoanTimeline(loan);

  const timelineIcons = {
    'loan-created': CreditCard,
    'due-date': Calendar,
    'payment': CheckCircle,
    'overdue': AlertTriangle,
    'closed': CheckCircle,
  };

  const timelineColors = {
    'loan-created': 'bg-primary text-primary-foreground',
    'due-date': 'bg-status-due-today text-status-due-today-foreground',
    'payment': 'bg-status-active text-status-active-foreground',
    'overdue': 'bg-status-overdue text-status-overdue-foreground',
    'closed': 'bg-status-closed text-status-closed-foreground',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">{loan.borrower.name}</h2>
          <p className="text-muted-foreground">Loan Details</p>
        </div>
        <StatusBadge status={calc.status} className="text-sm px-3 py-1" />
      </div>

      {/* Main info cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Borrower Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Borrower Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium">{loan.borrower.name}</span>
            </div>
            {loan.borrower.phone && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone</span>
                <span className="font-medium flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {loan.borrower.phone}
                </span>
              </div>
            )}
            {loan.notes && (
              <div>
                <span className="text-muted-foreground text-sm">Notes</span>
                <p className="mt-1 text-sm bg-muted/50 rounded-md p-2">{loan.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Loan Dates */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Loan Dates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Start Date</span>
              <span className="font-medium">{formatDate(loan.startDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Due Date</span>
              <span className={cn(
                "font-medium",
                calc.status === 'overdue' && "text-status-overdue",
                calc.status === 'due-today' && "text-status-due-today"
              )}>
                {formatDate(loan.dueDate)} ({formatDateRelative(loan.dueDate)})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Days Active</span>
              <span className="font-medium">{calc.daysActive} days</span>
            </div>
            {calc.daysOverdue > 0 && (
              <div className="flex justify-between text-status-overdue">
                <span>Days Overdue</span>
                <span className="font-medium">{calc.daysOverdue} days</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Financial Breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Financial Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-lg">
              <span className="text-muted-foreground">Principal Amount</span>
              <span className="font-bold font-mono-numbers">{formatCurrency(loan.principal)}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Base Interest (30 days)</span>
              <span className="font-medium font-mono-numbers">{formatCurrency(calc.baseInterest)}</span>
            </div>
            {calc.daysOverdue > 0 && (
              <>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Daily Interest Rate</span>
                  <span className="font-mono-numbers">{formatCurrency(calc.dailyInterestRate)}/day</span>
                </div>
                <div className="flex justify-between text-status-overdue">
                  <span>Extra Interest ({calc.daysOverdue} days)</span>
                  <span className="font-medium font-mono-numbers">{formatCurrency(calc.extraInterest)}</span>
                </div>
              </>
            )}
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Interest</span>
              <span className="font-medium font-mono-numbers">{formatCurrency(calc.totalInterest)}</span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="font-medium">Total Payable</span>
              <span className="font-bold font-mono-numbers">{formatCurrency(calc.totalPayable)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-status-active">
              <span>Total Paid</span>
              <span className="font-bold font-mono-numbers">{formatCurrency(calc.totalPaid)}</span>
            </div>
            <div className={cn(
              "flex justify-between text-lg",
              calc.remainingBalance > 0 ? "text-money-pending" : "text-status-active"
            )}>
              <span className="font-medium">Remaining Balance</span>
              <span className="font-bold font-mono-numbers">{formatCurrency(calc.remainingBalance)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Loan Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {timeline.map((event, index) => {
              const Icon = timelineIcons[event.type];
              const isPayment = event.type === 'payment';
              const payment = isPayment ? loan.payments.find(p => p.id === event.id) : null;

              return (
                <div key={event.id} className="flex gap-4 pb-6 last:pb-0">
                  {/* Timeline line */}
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                      timelineColors[event.type]
                    )}>
                      <Icon className="h-4 w-4" />
                    </div>
                    {index < timeline.length - 1 && (
                      <div className="w-0.5 flex-1 bg-border mt-2" />
                    )}
                  </div>

                  {/* Event content */}
                  <div className="flex-1 pt-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-medium">{event.title}</h4>
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(event.date)}
                        </p>
                      </div>
                      <div className="text-right">
                        {event.amount && (
                          <span className={cn(
                            "font-mono-numbers font-medium",
                            event.type === 'payment' && "text-status-active",
                            event.type === 'overdue' && "text-status-overdue"
                          )}>
                            {event.type === 'payment' ? '+' : ''}{formatCurrency(event.amount)}
                          </span>
                        )}
                        {isPayment && payment && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="mt-1 h-7 text-xs text-muted-foreground hover:text-destructive">
                                <Trash2 className="h-3 w-3 mr-1" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Payment</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this payment of {formatCurrency(payment.amount)}? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => onDeletePayment(payment.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {calc.status !== 'closed' && (
          <>
            <Button onClick={onAddPayment} className="flex-1 sm:flex-none">
              <Plus className="h-4 w-4 mr-2" />
              Record Payment
            </Button>
            <Button variant="outline" onClick={onEditLoan}>
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Loan
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Close Loan
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Close Loan</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to close this loan? This will mark it as settled regardless of the remaining balance ({formatCurrency(calc.remainingBalance)}).
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onCloseLoan}>
                    Close Loan
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="sm:ml-auto">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Loan
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Loan</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to permanently delete this loan to {loan.borrower.name}? This action cannot be undone and all payment history will be lost.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={onDeleteLoan}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
