'use client';
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { Wallet, TrendingUp, Receipt, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function BillingPage() {
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [tab, setTab] = useState<'transactions' | 'invoices'>('transactions');
  const [amount, setAmount] = useState(25);

  const fetchData = () => {
    apiClient.get('/billing/wallet').then(r => setWallet(r.data.data || r.data)).catch(() => {});
    apiClient.get('/billing/transactions').then(r => setTransactions(r.data.data?.transactions || r.data.data || [])).catch(() => {});
    apiClient.get('/billing/invoices').then(r => setInvoices(r.data.data?.invoices || r.data.data || [])).catch(() => {});
  };

  useEffect(() => { fetchData(); }, []);

  const presets = [10, 25, 50, 100];

  // Safely turn any value (number, numeric string, null, undefined) into a fixed-decimal string
  const money = (value: any, decimals = 2) => {
    const n = Number(value);
    return Number.isFinite(n) ? n.toFixed(decimals) : (0).toFixed(decimals);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Billing & Wallet</h1>

      {/* Balance Card */}
      <div className="bg-card rounded-2xl border p-6 shadow-sm" style={{background: 'linear-gradient(135deg, hsl(230 85% 58% / 0.1) 0%, hsl(250 75% 62% / 0.1) 100%)'}}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-sm">Current Balance</p>
            <p className="text-4xl font-bold mt-1">${money(wallet?.balance)}</p>
            <p className="text-muted-foreground text-sm mt-1">${money(wallet?.recentTransactions?.[0]?.amount)} last transaction</p>
          </div>
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center">
            <Wallet className="w-8 h-8 text-white" />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="bg-background/50 rounded-xl p-3">
            <p className="text-muted-foreground text-xs">This Month Spend</p>
            <p className="font-bold text-lg">${money(wallet?.thisMonthSpend)}</p>
          </div>
          <div className="bg-background/50 rounded-xl p-3">
            <p className="text-muted-foreground text-xs">Total Spend</p>
            <p className="font-bold text-lg">${money(wallet?.totalSpend)}</p>
          </div>
        </div>
      </div>

      {/* Top Up */}
      <div className="bg-card rounded-2xl border p-6 shadow-sm max-w-md">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" /> Top Up Wallet
        </h2>
        <div className="space-y-4">
          <div className="flex gap-2">
            {presets.map(p => (
              <button key={p} type="button" onClick={() => setAmount(p)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${amount === p ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-accent border'}`}>
                ${p}
              </button>
            ))}
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Custom Amount ($)</label>
            <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} min={5} max={500}
              className="w-full border rounded-xl px-4 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
          </div>
          <button
            className="w-full py-3 rounded-xl font-semibold text-white transition-all"
            style={{background: 'linear-gradient(135deg, hsl(230 85% 58%) 0%, hsl(250 75% 62%) 100%)'}}
            onClick={() => alert('Add Stripe keys to enable payments')}>
            Top Up ${amount}
          </button>
          <p className="text-xs text-muted-foreground text-center">Secured by Stripe — Add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to enable</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary rounded-xl p-1 w-fit">
        {(['transactions', 'invoices'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${tab === t ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'transactions' && (
        <div className="bg-card rounded-2xl border shadow-sm divide-y">
          {transactions.length === 0 ? (
            <div className="p-12 text-center">
              <Receipt className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-30" />
              <p className="text-muted-foreground text-sm">No transactions yet</p>
            </div>
          ) : transactions.map((tx: any) => (
            <div key={tx.id} className="p-4 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'credit' ? 'bg-emerald-100 dark:bg-emerald-950' : 'bg-red-100 dark:bg-red-950'}`}>
                {tx.type === 'credit'
                  ? <ArrowUpRight className="w-5 h-5 text-emerald-600" />
                  : <ArrowDownRight className="w-5 h-5 text-red-600" />}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{tx.description}</p>
                <p className="text-muted-foreground text-xs">{new Date(tx.createdAt).toLocaleDateString()}</p>
              </div>
              <span className={`font-semibold ${tx.type === 'credit' ? 'text-emerald-600' : 'text-red-600'}`}>
                {tx.type === 'credit' ? '+' : '-'}${money(Math.abs(Number(tx.amount) || 0), 4)}
              </span>
            </div>
          ))}
        </div>
      )}

      {tab === 'invoices' && (
        <div className="bg-card rounded-2xl border shadow-sm divide-y">
          {invoices.length === 0 ? (
            <div className="p-12 text-center">
              <Receipt className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-30" />
              <p className="text-muted-foreground text-sm">No invoices yet</p>
            </div>
          ) : invoices.map((inv: any) => (
            <div key={inv.id} className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <Receipt className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Invoice #{inv.invoiceNumber || inv.id?.slice(0,8)}</p>
                <p className="text-muted-foreground text-xs">{new Date(inv.createdAt).toLocaleDateString()}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${inv.status === 'paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'}`}>
                {inv.status}
              </span>
              <span className="font-semibold">${money(inv.amount)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}