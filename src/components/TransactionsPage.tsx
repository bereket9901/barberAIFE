import React, { useState } from 'react';
import { useStore } from '../store';
import { cn } from '../lib/utils';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Search, Filter, Receipt, CreditCard, Banknote, TrendingUp } from 'lucide-react';

export default function TransactionsPage() {
  const { transactions } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMethod, setFilterMethod] = useState('all');

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = searchQuery === '' ||
      tx.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.barberName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterMethod === 'all' || tx.paymentMethod === filterMethod;
    return matchesSearch && matchesFilter;
  });

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      telebirr: 'Telebirr', cbe_birr: 'CBE Birr', bank_transfer: 'Bank Transfer', cash: 'Cash', card: 'Card',
    };
    return labels[method] || method;
  };

  const getPaymentMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      telebirr: 'bg-success/10 text-success border-success/20',
      cbe_birr: 'bg-info/10 text-info border-info/20',
      bank_transfer: 'bg-primary/10 text-primary border-primary/20',
      cash: 'bg-warning/10 text-warning border-warning/20',
      card: 'bg-pink/10 text-pink border-pink/20',
    };
    return colors[method] || 'bg-muted text-muted-foreground';
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false,
    });
  };

  const totalRevenue = filteredTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  const avgTransaction = filteredTransactions.length > 0 ? Math.round(totalRevenue / filteredTransactions.length) : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-card">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center">
                <Receipt className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{filteredTransactions.length}</p>
                <p className="text-xs text-muted-foreground">Total Transactions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl gradient-success flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Revenue (ETB)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl gradient-info flex items-center justify-center">
                <Banknote className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{avgTransaction}</p>
                <p className="text-xs text-muted-foreground">Avg. Transaction (ETB)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-card">
        <CardContent className="p-4 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search transactions..."
              className="pl-10"
            />
          </div>
          <Select value={filterMethod} onValueChange={setFilterMethod}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              <SelectItem value="telebirr">Telebirr</SelectItem>
              <SelectItem value="cbe_birr">CBE Birr</SelectItem>
              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="card">Card</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card className="shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-accent/30">
              <TableHead>Transaction ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Barber</TableHead>
              <TableHead>Services</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Date/Time</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Receipt className="h-10 w-10 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">No transactions found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>
                    <code className="text-xs font-mono px-2 py-1 rounded-md bg-primary/10 text-primary font-medium">
                      {tx.transactionId}
                    </code>
                  </TableCell>
                  <TableCell className="font-medium">{tx.customerName}</TableCell>
                  <TableCell className="text-muted-foreground">{tx.barberName}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {tx.services.map((svc, i) => (
                        <Badge key={i} variant="secondary" className="text-[10px]">
                          {svc}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-foreground">{tx.amount} ETB</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("text-[10px]", getPaymentMethodColor(tx.paymentMethod))}>
                      {getPaymentMethodLabel(tx.paymentMethod)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">{formatTime(tx.timestamp)}</TableCell>
                  <TableCell>
                    <Badge className={cn(
                      "text-[10px]",
                      tx.status === 'paid' ? "bg-success/10 text-success border-success/20" :
                      tx.status === 'pending' ? "bg-warning/10 text-warning border-warning/20" :
                      "bg-destructive/10 text-destructive border-destructive/20"
                    )}>
                      {tx.status === 'paid' ? '✓ Paid' : tx.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
