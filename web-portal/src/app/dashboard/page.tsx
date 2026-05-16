'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Phone, MessageSquare, Hash, Wallet, TrendingUp, TrendingDown,
  Activity, Users, Clock, DollarSign, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useAuthStore } from '@/store/auth.store';
import { apiClient } from '@/lib/api';
import { formatCurrency, formatDuration } from '@/lib/utils';

const callsData = [
  { time: '00:00', inbound: 2, outbound: 1 },
  { time: '04:00', inbound: 0, outbound: 0 },
  { time: '08:00', inbound: 12, outbound: 8 },
  { time: '12:00', inbound: 18, outbound: 14 },
  { time: '16:00', inbound: 15, outbound: 11 },
  { time: '20:00', inbound: 7, outbound: 5 },
  { time: '23:59', inbound: 3, outbound: 2 },
];

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    calls: { total: 0, inbound: 0, outbound: 0, duration: 0 },
    messages: { total: 0, inbound: 0, outbound: 0 },
    numbers: { active: 0 },
    balance: 0,
    monthlySpend: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      const [callsRes, messagesRes, numbersRes, walletRes] = await Promise.all([
        apiClient.get('/calls/analytics?period=day'),
        apiClient.get('/messages/analytics?period=day'),
        apiClient.get('/numbers/my'),
        apiClient.get('/billing/wallet'),
      ]);

      setStats({
        calls: callsRes.data.data,
        messages: messagesRes.data.data,
        numbers: { active: numbersRes.data.data?.length || 0 },
        balance: walletRes.data.data?.balance || 0,
        monthlySpend: walletRes.data.data?.monthlySpend || 0,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Wallet Balance',
      value: formatCurrency(stats.balance),
      icon: Wallet,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50 dark:bg-emerald-950',
      change: null,
      sub: `$${stats.monthlySpend.toFixed(2)} this month`,
    },
    {
      title: "Today's Calls",
      value: stats.calls.total,
      icon: Phone,
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-950',
      change: { value: stats.calls.outbound, label: 'outbound', up: true },
      sub: formatDuration(stats.calls.duration),
    },
    {
      title: "Today's Messages",
      value: stats.messages.total,
      icon: MessageSquare,
      color: 'text-violet-500',
      bg: 'bg-violet-50 dark:bg-violet-950',
      change: { value: stats.messages.inbound, label: 'received', up: true },
      sub: `${stats.messages.outbound} sent`,
    },
    {
      title: 'Active Numbers',
      value: stats.numbers.active,
      icon: Hash,
      color: 'text-orange-500',
      bg: 'bg-orange-50 dark:bg-orange-950',
      change: null,
      sub: 'Click to manage',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">
          Welcome back, {user?.firstName} 👋
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Here&apos;s your communication overview for today
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card, idx) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            className="stat-card"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  {card.title}
                </p>
                <p className="text-3xl font-bold mt-1">{loading ? '—' : card.value}</p>
                {card.change && (
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    {card.change.up ? (
                      <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 text-red-500" />
                    )}
                    {card.change.value} {card.change.label}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Call Traffic Chart */}
        <div className="lg:col-span-2 bg-card rounded-xl border p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Call Traffic</h3>
              <p className="text-xs text-muted-foreground">Inbound vs Outbound today</p>
            </div>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={callsData}>
              <defs>
                <linearGradient id="inboundGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="outboundGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="time" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Area type="monotone" dataKey="inbound" name="Inbound" stroke="#3b82f6" fill="url(#inboundGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="outbound" name="Outbound" stroke="#8b5cf6" fill="url(#outboundGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Actions */}
        <div className="bg-card rounded-xl border p-5 shadow-sm">
          <h3 className="font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-2">
            {[
              { icon: Phone, label: 'Make a Call', href: '/calls', color: 'text-blue-500 bg-blue-50 dark:bg-blue-950' },
              { icon: MessageSquare, label: 'New Message', href: '/messages', color: 'text-violet-500 bg-violet-50 dark:bg-violet-950' },
              { icon: Hash, label: 'Get a Number', href: '/numbers/search', color: 'text-orange-500 bg-orange-50 dark:bg-orange-950' },
              { icon: Wallet, label: 'Add Funds', href: '/billing', color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950' },
            ].map((action) => (
              <a
                key={action.label}
                href={action.href}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer"
              >
                <div className={`w-8 h-8 rounded-lg ${action.color} flex items-center justify-center`}>
                  <action.icon className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">{action.label}</span>
                <ArrowUpRight className="w-3 h-3 text-muted-foreground ml-auto" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-card rounded-xl border shadow-sm">
        <div className="p-5 border-b flex items-center justify-between">
          <h3 className="font-semibold">Recent Activity</h3>
          <span className="text-xs text-muted-foreground">Last 24 hours</span>
        </div>
        <div className="divide-y">
          {[
            { type: 'call', icon: Phone, color: 'text-blue-500', desc: 'Outbound call to +1 (415) 555-2671', time: '2 min ago', sub: '3m 42s' },
            { type: 'sms', icon: MessageSquare, color: 'text-violet-500', desc: 'SMS received from +1 (323) 555-1234', time: '18 min ago', sub: 'Read' },
            { type: 'call', icon: Phone, color: 'text-orange-500', desc: 'Missed call from +44 7911 123456', time: '1 hr ago', sub: 'Missed' },
            { type: 'billing', icon: DollarSign, color: 'text-emerald-500', desc: 'Wallet top-up', time: '3 hrs ago', sub: '+$25.00' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
              <div className={`w-8 h-8 rounded-full bg-muted flex items-center justify-center`}>
                <item.icon className={`w-4 h-4 ${item.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.desc}</p>
                <p className="text-xs text-muted-foreground">{item.time}</p>
              </div>
              <span className="text-xs font-medium text-muted-foreground shrink-0">{item.sub}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

