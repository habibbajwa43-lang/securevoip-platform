'use client';
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { formatDuration, formatDate } from '@/lib/utils';
import { Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, PhoneOff } from 'lucide-react';

export default function CallsPage() {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [dialNumber, setDialNumber] = useState('');
  const [fromNumber, setFromNumber] = useState('');

  useEffect(() => {
    apiClient.get('/calls')
      .then(r => setCalls(r.data.data?.calls || r.data.data || []))
      .catch(() => setCalls([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? calls : calls.filter((c: any) =>
    c.direction === filter || c.status === filter
  );

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
      no_answer: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
      busy: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
      failed: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
      in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
    };
    return <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${map[status] || 'bg-secondary text-secondary-foreground'}`}>{status.replace('_', ' ')}</span>;
  };

  const dirIcon = (dir: string, status: string) => {
    if (status === 'no_answer') return <PhoneMissed className="w-4 h-4 text-red-500" />;
    if (dir === 'inbound') return <PhoneIncoming className="w-4 h-4 text-emerald-500" />;
    return <PhoneOutgoing className="w-4 h-4 text-blue-500" />;
  };

  const handleDial = async () => {
    if (!dialNumber || !fromNumber) return alert('Enter both numbers');
    try {
      await apiClient.post('/calls/initiate', { to: dialNumber, fromNumber, callType: 'voice' });
      alert('Call initiated!');
    } catch (e: any) {
      alert(e.response?.data?.message || 'Call failed');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Calls</h1>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Dialer */}
        <div className="bg-card rounded-2xl border p-6 space-y-4 shadow-sm">
          <h2 className="font-semibold">Make a Call</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">From Number</label>
              <input value={fromNumber} onChange={e => setFromNumber(e.target.value)}
                className="w-full border rounded-xl px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground"
                placeholder="+1234567890" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">To Number</label>
              <input value={dialNumber} onChange={e => setDialNumber(e.target.value)}
                className="w-full border rounded-xl px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground"
                placeholder="+1234567890" />
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-2">
              {['1','2','3','4','5','6','7','8','9','*','0','#'].map(k => (
                <button key={k} onClick={() => setDialNumber(p => p + k)}
                  className="keypad-button h-12 w-full rounded-xl text-base font-semibold bg-secondary hover:bg-accent transition-colors">
                  {k}
                </button>
              ))}
            </div>

            <button onClick={handleDial}
              className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all"
              style={{background: 'linear-gradient(135deg, hsl(142 70% 40%) 0%, hsl(160 65% 42%) 100%)'}}>
              <Phone className="w-5 h-5" />
              Call
            </button>
          </div>
        </div>

        {/* Call History */}
        <div className="xl:col-span-2 bg-card rounded-2xl border shadow-sm">
          <div className="p-4 border-b flex items-center gap-2">
            <span className="font-semibold">Call History</span>
            <div className="ml-auto flex gap-1">
              {['all', 'inbound', 'outbound', 'no_answer'].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs capitalize transition-colors font-medium ${filter === f ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}>
                  {f.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
          <div className="divide-y">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4 flex gap-3 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-secondary" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-secondary rounded w-1/3" />
                    <div className="h-3 bg-secondary rounded w-1/4" />
                  </div>
                </div>
              ))
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center">
                <PhoneOff className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-30" />
                <p className="text-muted-foreground text-sm">No calls found</p>
              </div>
            ) : (
              filtered.map((call: any) => (
                <div key={call.id} className="p-4 flex items-center gap-4 hover:bg-accent/50 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                    {dirIcon(call.direction, call.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">{call.toNumber || call.fromNumber}</span>
                      {statusBadge(call.status)}
                    </div>
                    <div className="text-muted-foreground text-xs">{formatDate(call.createdAt)}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-medium">{formatDuration(call.duration || 0)}</div>
                    <div className="text-muted-foreground text-xs">${(call.cost || 0).toFixed(4)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
