'use client';
import { useState } from 'react';

const mockUsers = Array.from({ length: 20 }, (_, i) => ({
  id: `user-${i}`, email: `user${i}@example.com`,
  firstName: ['John', 'Jane', 'Ali', 'Sara', 'Ahmed', 'Fatima'][i % 6],
  lastName: ['Smith', 'Doe', 'Khan', 'Ahmed', 'Hassan', 'Malik'][i % 6],
  role: i === 0 ? 'super_admin' : i < 3 ? 'admin' : 'user',
  status: i === 7 ? 'suspended' : 'active',
  walletBalance: (Math.random() * 100).toFixed(2),
  createdAt: new Date(Date.now() - Math.random() * 365 * 86400000).toLocaleDateString(),
}));

export default function UsersAdminPage() {
  const [search, setSearch] = useState('');
  const filtered = mockUsers.filter(u =>
    u.email.includes(search) || u.firstName.toLowerCase().includes(search.toLowerCase())
  );

  const roleBadge = (role: string) => {
    const map: Record<string, string> = {
      super_admin: 'badge-red', admin: 'badge-yellow', user: 'badge-blue',
    };
    return <span className={map[role] || 'badge-blue'}>{role.replace('_', ' ')}</span>;
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">User Management</h1>
        <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">
          + Invite User
        </button>
      </div>

      <div className="card">
        <div className="mb-4">
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="w-full max-w-xs bg-gray-800 border border-white/10 rounded-lg px-4 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            placeholder="Search users..." />
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 border-b border-white/10">
              <th className="text-left py-3">User</th>
              <th className="text-left py-3">Role</th>
              <th className="text-left py-3">Status</th>
              <th className="text-right py-3">Balance</th>
              <th className="text-left py-3">Joined</th>
              <th className="text-right py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map(user => (
              <tr key={user.id} className="hover:bg-white/5 transition-colors">
                <td className="py-3">
                  <div>
                    <p className="text-white font-medium">{user.firstName} {user.lastName}</p>
                    <p className="text-gray-400 text-xs">{user.email}</p>
                  </div>
                </td>
                <td className="py-3">{roleBadge(user.role)}</td>
                <td className="py-3">
                  <span className={user.status === 'active' ? 'badge-green' : 'badge-red'}>{user.status}</span>
                </td>
                <td className="py-3 text-right text-white">${user.walletBalance}</td>
                <td className="py-3 text-gray-400 text-xs">{user.createdAt}</td>
                <td className="py-3 text-right">
                  <button className="text-gray-400 hover:text-white transition-colors text-xs px-2 py-1 rounded border border-white/10 hover:border-white/30">
                    {user.status === 'active' ? 'Suspend' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
