'use client';
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function MonitoringPage() {
  const [activeCalls, setActiveCalls] = useState(Math.floor(Math.random() * 50 + 10));
  const [cpuData, setCpuData] = useState(
    Array.from({ length: 20 }, (_, i) => ({ t: i, cpu: Math.random() * 40 + 20, mem: Math.random() * 30 + 50 }))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCalls(v => Math.max(0, v + Math.floor(Math.random() * 5 - 2)));
      setCpuData(prev => [...prev.slice(1), {
        t: prev[prev.length - 1].t + 1,
        cpu: Math.random() * 40 + 20,
        mem: Math.random() * 30 + 50,
      }]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const services = [
    { name: 'API Server', status: 'healthy', uptime: '99.98%', requests: '1.2M/day', latency: '12ms' },
    { name: 'WebSocket', status: 'healthy', uptime: '99.95%', requests: `${activeCalls} active`, latency: '4ms' },
    { name: 'Database', status: 'healthy', uptime: '99.99%', requests: '450K/day', latency: '3ms' },
    { name: 'Redis', status: 'healthy', uptime: '100%', requests: '2.1M/day', latency: '1ms' },
    { name: 'Twilio', status: 'healthy', uptime: '99.9%', requests: '48K calls', latency: '45ms' },
    { name: 'Stripe', status: 'healthy', uptime: '99.9%', requests: '821 txns', latency: '120ms' },
  ];

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">Live Monitoring</h1>

      <div className="grid grid-cols-3 gap-6">
        <div className="stat-card border-l-4 border-green-500">
          <p className="text-gray-400 text-sm">Active Calls</p>
          <p className="text-3xl font-bold text-green-400">{activeCalls}</p>
          <p className="text-gray-500 text-xs">Real-time</p>
        </div>
        <div className="stat-card border-l-4 border-blue-500">
          <p className="text-gray-400 text-sm">Calls Today</p>
          <p className="text-3xl font-bold text-blue-400">1,284</p>
          <p className="text-gray-500 text-xs">+12% from yesterday</p>
        </div>
        <div className="stat-card border-l-4 border-purple-500">
          <p className="text-gray-400 text-sm">Connected Users</p>
          <p className="text-3xl font-bold text-purple-400">342</p>
          <p className="text-gray-500 text-xs">WebSocket connections</p>
        </div>
      </div>

      <div className="card">
        <h3 className="text-white font-semibold mb-4">System Resources (Live)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={cpuData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey="t" hide />
            <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 10 }} />
            <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #ffffff20', borderRadius: 8, color: '#fff' }} />
            <Line type="monotone" dataKey="cpu" stroke="#6C63FF" strokeWidth={2} dot={false} name="CPU %" />
            <Line type="monotone" dataKey="mem" stroke="#FF6584" strokeWidth={2} dot={false} name="Memory %" />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-2 text-xs text-gray-400">
          <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-indigo-500 inline-block" /> CPU</span>
          <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-pink-500 inline-block" /> Memory</span>
        </div>
      </div>

      <div className="card">
        <h3 className="text-white font-semibold mb-4">Services</h3>
        <div className="space-y-3">
          {services.map(s => (
            <div key={s.name} className="flex items-center gap-4 bg-gray-800 rounded-lg p-4">
              <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
              <div className="flex-1">
                <p className="text-white font-medium text-sm">{s.name}</p>
              </div>
              <div className="text-right grid grid-cols-3 gap-6 text-xs">
                <div><p className="text-gray-400">Uptime</p><p className="text-green-400 font-semibold">{s.uptime}</p></div>
                <div><p className="text-gray-400">Requests</p><p className="text-white">{s.requests}</p></div>
                <div><p className="text-gray-400">Latency</p><p className="text-blue-400">{s.latency}</p></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
