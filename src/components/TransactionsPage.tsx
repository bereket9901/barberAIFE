import React, { useState } from 'react';
import { useStore } from '../store';
import { cn } from '../lib/utils';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Search, Filter, Receipt, CreditCard, Banknote } from 'lucide-react';

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
      telebirr: 'Telebirr',
      cbe_birr: 'CBE Birr',
      bank_transfer: 'Bank Transfer',
      cash: 'Cash',
      card: 'Card',
    };
    return labels[method] || method;
  };

  const getPaymentMethodIcon = (method: string) => {
    if (method === 'cash') return <Banknote className="h-4 w-4" />;
    return <CreditCard className="h-4 w-4" />;
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Transaction History</h2>
        <p className="text-muted-foreground">All completed transactions and payment records</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer, barber, or transaction ID..."
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filterMethod} onValueChange={setFilterMethod}>
            <SelectTrigger className="w-[180px]">
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
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Transactions</p>
            <p className="text-2xl font-bold">{filteredTransactions.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-bold text-primary">
              {filteredTransactions.reduce((sum, tx) => sum + tx.amount, 0).toLocaleString()} ETB
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Avg. Transaction</p>
            <p className="text-2xl font-bold">
              {filteredTransactions.length > 0
                ? Math.round(filteredTransactions.reduce((sum, tx) => sum + tx.amount, 0) / filteredTransactions.length)
                : 0} ETB
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
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
                  <TableCell colSpan={8} className="h-24 text-center">
                    <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No transactions found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>
                      <code className="text-xs font-mono px-2 py-1 rounded bg-muted text-primary">
                        {tx.transactionId}
                      </code>
                    </TableCell>
                    <TableCell className="font-medium">{tx.customerName}</TableCell>
                    <TableCell>{tx.barberName}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {tx.services.map((svc, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {svc}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-primary">{tx.amount} ETB</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getPaymentMethodIcon(tx.paymentMethod)}
                        <span>{getPaymentMethodLabel(tx.paymentMethod)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatTime(tx.timestamp)}</TableCell>
                    <TableCell>
                      <Badge variant={tx.status === 'paid' ? 'default' : tx.status === 'pending' ? 'secondary' : 'destructive'}>
                        {tx.status === 'paid' ? '✓ Paid' : tx.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
