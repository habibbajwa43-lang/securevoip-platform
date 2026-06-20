'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Phone, MessageSquare, Hash, Wallet, Activity, DollarSign,
  ArrowUpRight, ArrowDownRight, Sparkles, Check, Inbox,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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

  const isNewAccount =
    !loading && stats.balance === 0 && stats.numbers.active === 0 && stats.calls.total === 0;

  const hasActivityToday = stats.calls.total > 0 || stats.messages.total > 0;

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
      change: stats.calls.total > 0 ? { value: stats.calls.outbound, label: 'outbound', up: true } : null,
      sub: stats.calls.duration > 0 ? formatDuration(stats.calls.duration) : 'No calls yet',
    },
    {
      title: "Today's Messages",
      value: stats.messages.total,
      icon: MessageSquare,
      color: 'text-violet-500',
      bg: 'bg-violet-50 dark:bg-violet-950',
      change: stats.messages.total > 0 ? { value: stats.messages.inbound, label: 'received', up: true } : null,
      sub: stats.messages.total > 0 ? `${stats.messages.outbound} sent` : 'No messages yet',
    },
    {
      title: 'Active Numbers',
      value: stats.numbers.active,
      icon: Hash,
      color: 'text-orange-500',
      bg: 'bg-orange-50 dark:bg-orange-950',
      change: null,
      sub: stats.numbers.active > 0 ? 'Click to manage' : 'Get your first number',
    },
  ];

  const onboardingSteps = [
    { label: 'Add funds to your wallet', done: stats.balance > 0, href: '/billing', icon: Wallet },
    { label: 'Get your first phone number', done: stats.numbers.active > 0, href: '/numbers/search', icon: Hash },
    { label: 'Make your first call', done: stats.calls.total > 0, href: '/calls', icon: Phone },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Welcome back, {user?.firstName} 👋
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Here&apos;s your communication overview for today
        </p>
      </div>

      {isNewAccount && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-primary-500/20 bg-gradient-to-br from-primary-500/10 via-card to-secondary-500/5 p-5"
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-primary-500/15 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-primary-500" />
            </div>
            <div>
              <h3 className="font-semibold">Let&apos;s set up your account</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                Three quick steps and you&apos;ll be ready to call, text, and manage numbers.
              </p>
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            {onboardingSteps.map((step) => {
              const StepIcon = step.icon;
              return (
                <a
                  key={step.label}
                  href={step.href}
                  className="group flex items-center gap-3 p-3 rounded-lg bg-background/60 border hover:border-primary-500/40 hover:bg-background transition-colors"
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                      step.done
                        ? 'bg-emerald-500 text-white'
                        : 'bg-muted text-muted-foreground group-hover:bg-primary-500/15 group-hover:text-primary-500'
                    }`}
                  >
                    {step.done ? <Check className="w-3.5 h-3.5" /> : <StepIcon className="w-3.5 h-3.5" />}
                  </div>
                  <span className={`text-sm font-medium ${step.done ? 'text-muted-foreground line-through' : ''}`}>
                    {step.label}
                  </span>
                </a>
              );
            })}
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const CardIcon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              whileHover={{ y: -2 }}
              className="stat-card transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    {card.title}
                  </p>
                  {loading ? (
                    <div className="h-8 w-16 mt-2 rounded-md bg-muted animate-pulse" />
                  ) : (
                    <p className="text-3xl font-bold mt-1">{card.value}</p>
                  )}
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
                  <p className="text-xs text-muted-foreground mt-1">{loading ? '\u00A0' : card.sub}</p>
                </div>
                <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center shrink-0`}>
                  <CardIcon className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card rounded-xl border p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Call Traffic</h3>
              <p className="text-xs text-muted-foreground">Inbound vs outbound today</p>
            </div>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </div>

          {!loading && !hasActivityToday ? (
            <div className="h-[180px] flex flex-col items-center justify-center text-center gap-2">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <Phone className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No calls yet today</p>
              <a href="/calls" className="text-xs font-medium text-primary-500 hover:text-primary-400">
                Make your first call -&gt;
              </a>
            </div>
          ) : (
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
          )}
        </div>

        <div className="bg-card rounded-xl border p-5 shadow-sm">
          <h3 className="font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-2">
            {[
              { icon: Phone, label: 'Make a Call', href: '/calls', color: 'text-blue-500 bg-blue-50 dark:bg-blue-950' },
              { icon: MessageSquare, label: 'New Message', href: '/messages', color: 'text-violet-500 bg-violet-50 dark:bg-violet-950' },
              { icon: Hash, label: 'Get a Number', href: '/numbers/search', color: 'text-orange-500 bg-orange-50 dark:bg-orange-950' },
              { icon: Wallet, label: 'Add Funds', href: '/billing', color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950' },
            ].map((action) => {
              const ActionIcon = action.icon;
              return (
                <a
                  key={action.label}
                  href={action.href}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer"
                >
                  <div className={`w-8 h-8 rounded-lg ${action.color} flex items-center justify-center`}>
                    <ActionIcon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium">{action.label}</span>
                  <ArrowUpRight className="w-3 h-3 text-muted-foreground ml-auto" />
                </a>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border shadow-sm">
        <div className="p-5 border-b flex items-center justify-between">
          <h3 className="font-semibold">Recent Activity</h3>
          <span className="text-xs text-muted-foreground">Last 24 hours</span>
        </div>
        {!loading && !hasActivityToday ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 px-5 text-center">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <Inbox className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No activity yet</p>
            <p className="text-xs text-muted-foreground max-w-xs">
              Your calls, messages, and billing events will show up here as you use SecureVoIP.
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {stats.calls.total > 0 && (
              <div className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <Phone className="w-4 h-4 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{stats.calls.total} call{stats.calls.total !== 1 ? 's' : ''} today</p>
                  <p className="text-xs text-muted-foreground">{stats.calls.outbound} outbound, {stats.calls.inbound} inbound</p>
                </div>
                <span className="text-xs font-medium text-muted-foreground shrink-0">{formatDuration(stats.calls.duration)}</span>
              </div>
            )}
            {stats.messages.total > 0 && (
              <div className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-violet-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{stats.messages.total} message{stats.messages.total !== 1 ? 's' : ''} today</p>
                  <p className="text-xs text-muted-foreground">{stats.messages.outbound} sent, {stats.messages.inbound} received</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}