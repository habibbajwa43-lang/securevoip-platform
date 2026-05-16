'use client';
import { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const mockStats = {
  totalUsers: 1284, activeUsers: 1101, totalCalls: 48293,
  callsLast30: 3821, totalMessages: 92847, totalNumbers: 2043, totalRevenue: 84920.50,
};

const mockCallData = Array.from({ length: 14 }, (_, i) => ({
  date: new Date(Date.now() - (13 - i) * 86400000).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
  count: Math.floor(Math.random() * 300 + 100),
  totalDuration: Math.floor(Math.random() * 10000 + 2000),
}));

const mockRevenue = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 86400000).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
  revenue: Math.floor(Math.random() * 5000 + 1000),
}));

export default function AdminDashboard() {
  const [stats] = useState(mockStats);

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers.toLocaleString(), sub: `${stats.activeUsers} active`, color: 'text-blue-400', icon: '👥' },
    { label: 'Total Calls', value: stats.totalCalls.toLocaleString(), sub: `${stats.callsLast30} last 30d`, color: 'text-green-400', icon: '📞' },
    { label: 'Messages', value: stats.totalMessages.toLocaleString(), sub: 'All time', color: 'text-purple-400', icon: '💬' },
    { label: 'Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, sub: 'Total collected', color: 'text-yellow-400', icon: '💰' },
  ];

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <span className="text-gray-400 text-sm">{new Date().toLocaleDateString('en', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6">
        {statCards.map(card => (
          <div key={card.label} className="stat-card">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">{card.label}</span>
              <span className="text-2xl">{card.icon}</span>
            </div>
            <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
            <div className="text-gray-500 text-xs">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-white font-semibold mb-4">Call Traffic (14 Days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={mockCallData}>
              <defs>
                <linearGradient id="callGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6C63FF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6C63FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #ffffff20', borderRadius: 8, color: '#fff' }} />
              <Area type="monotone" dataKey="count" stroke="#6C63FF" fill="url(#callGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-white font-semibold mb-4">Revenue (30 Days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={mockRevenue.filter((_, i) => i % 3 === 0)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #ffffff20', borderRadius: 8, color: '#fff' }} />
              <Bar dataKey="revenue" fill="#FF6584" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* System Health */}
      <div className="card">
        <h3 className="text-white font-semibold mb-4">System Health</h3>
        <div className="grid grid-cols-4 gap-4">
          {[
            { name: 'API Server', status: 'online', latency: '12ms' },
            { name: 'Database', status: 'online', latency: '3ms' },
            { name: 'Redis Cache', status: 'online', latency: '1ms' },
            { name: 'Twilio', status: 'online', latency: '45ms' },
          ].map(s => (
            <div key={s.name} className="flex items-center gap-3 bg-gray-800 rounded-lg p-3">
              <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
              <div>
                <p className="text-white text-sm font-medium">{s.name}</p>
                <p className="text-gray-400 text-xs">{s.latency}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
