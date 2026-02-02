import { useState } from 'react';
import { Loan } from '@/types/loan';
import { calculateLoan } from '@/utils/loanCalculations';
import { LoanCard } from '@/components/LoanCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, SortAsc } from 'lucide-react';

interface LoanListProps {
  loans: Loan[];
  onSelectLoan: (loan: Loan) => void;
  onExtendLoan?: (id: string) => void;
}

type SortOption = 'newest' | 'oldest' | 'amount-high' | 'amount-low' | 'due-soon';
type FilterOption = 'all' | 'active' | 'overdue' | 'closed' | 'partial';

export function LoanList({ loans, onSelectLoan, onExtendLoan }: LoanListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');

  // Calculate all loans
  const calculations = loans.map(calculateLoan);

  // Filter loans
  const filteredCalculations = calculations.filter(calc => {
    // Search filter
    const matchesSearch = calc.loan.borrower.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (calc.loan.borrower.phone?.includes(searchQuery)) ||
      (calc.loan.notes?.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    // Status filter
    switch (filterBy) {
      case 'active':
        return calc.status === 'active' || calc.status === 'due-today';
      case 'overdue':
        return calc.status === 'overdue';
      case 'closed':
        return calc.status === 'closed';
      case 'partial':
        return calc.status === 'partially-paid';
      default:
        return true;
    }
  });

  // Sort loans
  const sortedCalculations = [...filteredCalculations].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.loan.createdAt).getTime() - new Date(a.loan.createdAt).getTime();
      case 'oldest':
        return new Date(a.loan.createdAt).getTime() - new Date(b.loan.createdAt).getTime();
      case 'amount-high':
        return b.loan.principal - a.loan.principal;
      case 'amount-low':
        return a.loan.principal - b.loan.principal;
      case 'due-soon':
        return new Date(a.loan.dueDate).getTime() - new Date(b.loan.dueDate).getTime();
      default:
        return 0;
    }
  });

  // Move overdue and due-today to top
  const prioritizedCalculations = [...sortedCalculations].sort((a, b) => {
    const priority = { 'due-today': 0, 'overdue': 1, 'active': 2, 'partially-paid': 3, 'closed': 4 };
    return priority[a.status] - priority[b.status];
  });

  return (
    <div className="space-y-4">
      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={filterBy} onValueChange={(v) => setFilterBy(v as FilterOption)}>
            <SelectTrigger className="w-[130px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Loans</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-[140px]">
              <SortAsc className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="amount-high">Highest Amount</SelectItem>
              <SelectItem value="amount-low">Lowest Amount</SelectItem>
              <SelectItem value="due-soon">Due Soon</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Showing {prioritizedCalculations.length} of {loans.length} loans
      </p>

      {/* Loan cards */}
      <div className="space-y-3">
        {prioritizedCalculations.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {loans.length === 0 
              ? "No loans yet. Add your first loan to get started!"
              : "No loans match your search criteria."
            }
          </div>
        ) : (
          prioritizedCalculations.map(calc => (
            <LoanCard
              key={calc.loan.id}
              calculation={calc}
              onClick={() => onSelectLoan(calc.loan)}
              onExtend={onExtendLoan}
            />
          ))
        )}
      </div>
    </div>
  );
}
