'use client';
import { useState } from 'react';

const mockTransactions = Array.from({ length: 20 }, (_, i) => ({
  id: `tx-${i}`,
  user: `user${i % 8}@example.com`,
  type: i % 4 === 0 ? 'credit' : 'debit',
  amount: parseFloat((Math.random() * 50 + 1).toFixed(2)),
  description: ['Wallet top-up', 'Call charge', 'SMS charge', 'Number fee', 'Refund'][i % 5],
  status: i === 5 ? 'failed' : 'completed',
  createdAt: new Date(Date.now() - i * 3600000).toLocaleDateString(),
}));

export default function BillingAdminPage() {
  const [tab, setTab] = useState<'transactions' | 'invoices'>('transactions');
  const totalRevenue = mockTransactions.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold text-white">Billing & Revenue</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, color: 'text-green-400', icon: '💰' },
          { label: 'This Month', value: '$8,420.50', color: 'text-blue-400', icon: '📅' },
          { label: 'Pending', value: '$1,240.00', color: 'text-yellow-400', icon: '⏳' },
          { label: 'Failed Txns', value: '3', color: 'text-red-400', icon: '❌' },
        ].map(c => (
          <div key={c.label} className="stat-card">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">{c.label}</span>
              <span className="text-xl">{c.icon}</span>
            </div>
            <div className={`text-2xl font-bold ${c.color}`}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-800 rounded-lg p-1 w-fit">
        {(['transactions', 'invoices'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-all ${tab === t ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 border-b border-white/10">
              <th className="text-left py-3">User</th>
              <th className="text-left py-3">Description</th>
              <th className="text-left py-3">Type</th>
              <th className="text-left py-3">Status</th>
              <th className="text-right py-3">Amount</th>
              <th className="text-left py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {mockTransactions.map(tx => (
              <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                <td className="py-3 text-gray-300 text-xs">{tx.user}</td>
                <td className="py-3 text-white">{tx.description}</td>
                <td className="py-3">
                  <span className={tx.type === 'credit' ? 'badge-green' : 'badge-blue'}>{tx.type}</span>
                </td>
                <td className="py-3">
                  <span className={tx.status === 'completed' ? 'badge-green' : 'badge-red'}>{tx.status}</span>
                </td>
                <td className={`py-3 text-right font-semibold ${tx.type === 'credit' ? 'text-green-400' : 'text-white'}`}>
                  {tx.type === 'credit' ? '+' : '-'}${tx.amount.toFixed(2)}
                </td>
                <td className="py-3 text-gray-400 text-xs">{tx.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
