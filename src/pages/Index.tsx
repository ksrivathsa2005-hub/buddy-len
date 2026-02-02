import { useState, useMemo } from 'react';
import { useLoans } from '@/hooks/useLoans';
import { Loan } from '@/types/loan';
import { calculateDashboardSummary } from '@/utils/loanCalculations';
import { Dashboard } from '@/components/Dashboard';
import { LoanList } from '@/components/LoanList';
import { LoanDetail } from '@/components/LoanDetail';
import { AddLoanDialog } from '@/components/AddLoanDialog';
import { PaymentDialog } from '@/components/PaymentDialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, LayoutDashboard, List, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { 
    loans, 
    addLoan, 
    updateLoan, 
    deleteLoan, 
    extendLoan,
    closeLoan, 
    addPayment, 
    deletePayment,
    isLoading 
  } = useLoans();
  const { toast } = useToast();

  // UI state
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [addLoanDialogOpen, setAddLoanDialogOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Calculate dashboard summary
  const summary = useMemo(() => calculateDashboardSummary(loans), [loans]);

  // Handle adding a new loan
  const handleAddLoan = async (data: {
    borrower: { name: string; phone?: string };
    principal: number;
    fixedInterest: number;
    startDate: string;
    notes?: string;
  }) => {
    try {
      if (editingLoan) {
        // Update existing loan
        await updateLoan(editingLoan.id, {
          borrower: data.borrower,
          principal: data.principal,
          fixedInterest: data.fixedInterest,
          startDate: data.startDate,
          notes: data.notes,
        });
        toast({
          title: 'Loan Updated',
          description: `Loan to ${data.borrower.name} has been updated.`,
        });
        // Update selected loan if viewing
        if (selectedLoan?.id === editingLoan.id) {
          const updated = loans.find(l => l.id === editingLoan.id);
          if (updated) setSelectedLoan({ ...updated, ...data });
        }
      } else {
        // Add new loan
        await addLoan(data);
        toast({
          title: 'Loan Added',
          description: `New loan of ₹${data.principal.toLocaleString()} to ${data.borrower.name} created.`,
        });
      }
      setEditingLoan(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save loan. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Handle adding a payment
  const handleAddPayment = async (amount: number, date: string, notes?: string) => {
    try {
      if (!selectedLoan) return;
      await addPayment(selectedLoan.id, amount, date, notes);
      toast({
        title: 'Payment Recorded',
        description: `₹${amount.toLocaleString()} payment from ${selectedLoan.borrower.name} recorded.`,
      });
      // Refresh selected loan
      const updated = loans.find(l => l.id === selectedLoan.id);
      if (updated) setSelectedLoan(updated);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to record payment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Handle closing a loan
  const handleCloseLoan = async () => {
    try {
      if (!selectedLoan) return;
      await closeLoan(selectedLoan.id);
      toast({
        title: 'Loan Closed',
        description: `Loan to ${selectedLoan.borrower.name} has been marked as closed.`,
      });
      setSelectedLoan(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to close loan. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Handle deleting a loan
  const handleDeleteLoan = async () => {
    try {
      if (!selectedLoan) return;
      const name = selectedLoan.borrower.name;
      await deleteLoan(selectedLoan.id);
      toast({
        title: 'Loan Deleted',
        description: `Loan to ${name} has been permanently deleted.`,
        variant: 'destructive',
      });
      setSelectedLoan(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete loan. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Handle extending a loan by 30 days
  const handleExtendLoan = async (id: string) => {
    try {
      const loan = loans.find(l => l.id === id);
      if (!loan) return;
      await extendLoan(id);
      toast({
        title: 'Loan Extended',
        description: `Loan to ${loan.borrower.name} extended by 30 days.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to extend loan. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Handle deleting a payment
  const handleDeletePayment = async (paymentId: string) => {
    try {
      if (!selectedLoan) return;
      await deletePayment(selectedLoan.id, paymentId);
      toast({
        title: 'Payment Deleted',
        description: 'Payment has been removed.',
      });
      // Refresh selected loan
      const updated = loans.find(l => l.id === selectedLoan.id);
      if (updated) setSelectedLoan(updated);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete payment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Handle selecting a loan for detail view
  const handleSelectLoan = (loan: Loan) => {
    setSelectedLoan(loan);
    setActiveTab('loans');
  };

  // Handle editing a loan
  const handleEditLoan = () => {
    if (!selectedLoan) return;
    setEditingLoan(selectedLoan);
    setAddLoanDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">LoanLedger</h1>
                <p className="text-xs text-muted-foreground">Personal money tracker</p>
              </div>
            </div>
            <Button 
              onClick={() => {
                setEditingLoan(null);
                setAddLoanDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Loan
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container max-w-6xl mx-auto px-4 py-6">
        {selectedLoan ? (
          // Detail view
          <LoanDetail
            loan={loans.find(l => l.id === selectedLoan.id) || selectedLoan}
            onBack={() => setSelectedLoan(null)}
            onAddPayment={() => setPaymentDialogOpen(true)}
            onEditLoan={handleEditLoan}
            onCloseLoan={handleCloseLoan}
            onDeleteLoan={handleDeleteLoan}
            onDeletePayment={handleDeletePayment}
          />
        ) : (
          // Tabs view
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
              <TabsTrigger value="dashboard" className="gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="loans" className="gap-2">
                <List className="h-4 w-4" />
                All Loans
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6 animate-fade-in">
              <Dashboard summary={summary} />
              
              {/* Quick access to loans */}
              {loans.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Recent Loans</h2>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('loans')}>
                      View All
                    </Button>
                  </div>
                  <LoanList 
                    loans={loans.slice(0, 3)} 
                    onSelectLoan={handleSelectLoan}
                    onExtendLoan={handleExtendLoan}
                  />
                </div>
              )}

              {/* Empty state */}
              {loans.length === 0 && (
                <div className="text-center py-16">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No loans yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start tracking your personal loans by adding your first entry.
                  </p>
                  <Button onClick={() => setAddLoanDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Loan
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="loans" className="animate-fade-in">
              <LoanList loans={loans} onSelectLoan={handleSelectLoan} onExtendLoan={handleExtendLoan} />
            </TabsContent>
          </Tabs>
        )}
      </main>

      {/* Dialogs */}
      <AddLoanDialog
        open={addLoanDialogOpen}
        onOpenChange={(open) => {
          setAddLoanDialogOpen(open);
          if (!open) setEditingLoan(null);
        }}
        onSubmit={handleAddLoan}
        editLoan={editingLoan}
      />

      <PaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        onSubmit={handleAddPayment}
        loan={selectedLoan}
      />
    </div>
  );
};

export default Index;
