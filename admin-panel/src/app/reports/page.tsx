'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const monthlyData = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => ({
  month: m,
  calls: Math.floor(Math.random() * 5000 + 2000),
  sms: Math.floor(Math.random() * 8000 + 3000),
  revenue: Math.floor(Math.random() * 15000 + 5000),
  users: Math.floor(Math.random() * 100 + 50),
}));

export default function ReportsPage() {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold text-white">Reports & Analytics</h1>

      <div className="grid grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-white font-semibold mb-4">Monthly Revenue ($)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #ffffff20', borderRadius: 8, color: '#fff' }} />
              <Bar dataKey="revenue" fill="#6C63FF" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-white font-semibold mb-4">Calls & SMS Volume</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #ffffff20', borderRadius: 8, color: '#fff' }} />
              <Line type="monotone" dataKey="calls" stroke="#6C63FF" strokeWidth={2} dot={false} name="Calls" />
              <Line type="monotone" dataKey="sms" stroke="#FF6584" strokeWidth={2} dot={false} name="SMS" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-white font-semibold mb-4">New Users / Month</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #ffffff20', borderRadius: 8, color: '#fff' }} />
              <Bar dataKey="users" fill="#FF6584" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card space-y-4">
          <h3 className="text-white font-semibold">Key Metrics</h3>
          {[
            { label: 'Avg Call Duration', value: '4m 32s', trend: '+8%' },
            { label: 'SMS Delivery Rate', value: '98.4%', trend: '+0.2%' },
            { label: 'Churn Rate', value: '2.1%', trend: '-0.5%' },
            { label: 'ARPU', value: '$24.80', trend: '+12%' },
            { label: 'Support Tickets', value: '142', trend: '-18%' },
          ].map(m => (
            <div key={m.label} className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-gray-400 text-sm">{m.label}</span>
              <div className="flex items-center gap-3">
                <span className="text-white font-semibold">{m.value}</span>
                <span className={`text-xs ${m.trend.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{m.trend}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
