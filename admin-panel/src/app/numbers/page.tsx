'use client';
import { useState } from 'react';

const mockNumbers = Array.from({ length: 15 }, (_, i) => ({
  id: `num-${i}`,
  number: `+1${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
  country: ['US', 'US', 'GB', 'CA', 'AU'][i % 5],
  type: ['local', 'local', 'toll_free', 'mobile'][i % 4],
  status: i === 3 ? 'suspended' : 'active',
  assignedTo: i % 3 === 0 ? null : `user${i}@example.com`,
  monthlyCost: [1.00, 2.00, 1.50][i % 3],
  createdAt: new Date(Date.now() - Math.random() * 365 * 86400000).toLocaleDateString(),
}));

export default function NumbersAdminPage() {
  const [numbers] = useState(mockNumbers);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = numbers.filter(n => {
    const matchSearch = n.number.includes(search) || (n.assignedTo || '').includes(search);
    const matchFilter = filter === 'all' || n.status === filter || n.type === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Phone Numbers</h1>
        <div className="flex gap-3 text-sm">
          <span className="px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20">{numbers.filter(n => n.status === 'active').length} Active</span>
          <span className="px-3 py-1.5 rounded-lg bg-gray-800 text-gray-300 border border-white/10">{numbers.filter(n => !n.assignedTo).length} Unassigned</span>
        </div>
      </div>
      <div className="flex gap-3 flex-wrap">
        <input value={search} onChange={e => setSearch(e.target.value)}
          className="bg-gray-800 border border-white/10 rounded-lg px-4 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 w-64"
          placeholder="Search number or user..." />
        {['all', 'active', 'suspended', 'local', 'toll_free'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-2 rounded-lg text-sm capitalize transition-colors ${filter === f ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white border border-white/10'}`}>
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 border-b border-white/10">
              <th className="text-left py-3">Number</th>
              <th className="text-left py-3">Country</th>
              <th className="text-left py-3">Type</th>
              <th className="text-left py-3">Status</th>
              <th className="text-left py-3">Assigned To</th>
              <th className="text-right py-3">Cost/mo</th>
              <th className="text-right py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map(n => (
              <tr key={n.id} className="hover:bg-white/5 transition-colors">
                <td className="py-3 text-white font-mono font-medium">{n.number}</td>
                <td className="py-3 text-gray-300">{n.country}</td>
                <td className="py-3"><span className="badge-blue capitalize">{n.type.replace('_', ' ')}</span></td>
                <td className="py-3"><span className={n.status === 'active' ? 'badge-green' : 'badge-red'}>{n.status}</span></td>
                <td className="py-3 text-gray-400 text-xs">{n.assignedTo || '— Unassigned —'}</td>
                <td className="py-3 text-right text-white">${n.monthlyCost.toFixed(2)}</td>
                <td className="py-3 text-right">
                  <div className="flex gap-2 justify-end">
                    <button className="text-xs px-2 py-1 rounded border border-white/10 text-gray-400 hover:text-white transition-colors">{n.status === 'active' ? 'Suspend' : 'Activate'}</button>
                    <button className="text-xs px-2 py-1 rounded border border-red-500/30 text-red-400 hover:border-red-500 transition-colors">Release</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
