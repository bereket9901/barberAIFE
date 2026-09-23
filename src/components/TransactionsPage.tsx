import React, { useState } from 'react';
import { useStore } from '../store';
import { Search, Filter, Receipt, CreditCard, Banknote } from 'lucide-react';

export default function TransactionsPage() {
  const { transactions, darkMode } = useStore();
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
    if (method === 'cash') return <Banknote className="w-4 h-4" />;
    return <CreditCard className="w-4 h-4" />;
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
        <h2 className="text-2xl font-bold">Transaction History</h2>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          All completed transactions and payment records
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer, barber, or transaction ID..."
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm ${
              darkMode ? 'bg-gray-900 border-gray-700 text-white placeholder:text-gray-500' : 'bg-white border-gray-200 placeholder:text-gray-400'
            }`}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            className={`px-4 py-2.5 rounded-xl border text-sm ${
              darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200'
            }`}
          >
            <option value="all">All Methods</option>
            <option value="telebirr">Telebirr</option>
            <option value="cbe_birr">CBE Birr</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'}`}>
          <p className="text-xs text-gray-400 mb-1">Total Transactions</p>
          <p className="text-2xl font-bold">{filteredTransactions.length}</p>
        </div>
        <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'}`}>
          <p className="text-xs text-gray-400 mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-emerald-500">
            {filteredTransactions.reduce((sum, tx) => sum + tx.amount, 0).toLocaleString()} ETB
          </p>
        </div>
        <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'}`}>
          <p className="text-xs text-gray-400 mb-1">Avg. Transaction</p>
          <p className="text-2xl font-bold">
            {filteredTransactions.length > 0
              ? Math.round(filteredTransactions.reduce((sum, tx) => sum + tx.amount, 0) / filteredTransactions.length)
              : 0} ETB
          </p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className={`rounded-xl border overflow-hidden ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={darkMode ? 'bg-gray-800/50' : 'bg-gray-50'}>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Transaction ID</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Customer</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Barber</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Services</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Payment</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Date/Time</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-gray-800' : 'divide-gray-100'}`}>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <Receipt className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">No transactions found</p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className={`${darkMode ? 'hover:bg-gray-800/30' : 'hover:bg-gray-50'} transition-colors`}>
                    <td className="px-6 py-4">
                      <code className={`text-xs font-mono px-2 py-1 rounded ${darkMode ? 'bg-gray-800 text-emerald-400' : 'bg-gray-100 text-emerald-600'}`}>
                        {tx.transactionId}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">{tx.customerName}</td>
                    <td className="px-6 py-4 text-sm">{tx.barberName}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {tx.services.map((svc, i) => (
                          <span key={i} className={`text-xs px-2 py-0.5 rounded-full ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                            {svc}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-sm text-emerald-500">{tx.amount} ETB</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getPaymentMethodIcon(tx.paymentMethod)}
                        <span className="text-sm">{getPaymentMethodLabel(tx.paymentMethod)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">{formatTime(tx.timestamp)}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        tx.status === 'paid'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : tx.status === 'pending'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-red-500/20 text-red-400'
                      }`}>
                        {tx.status === 'paid' ? '✓ Paid' : tx.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
