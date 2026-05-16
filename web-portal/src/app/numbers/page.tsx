'use client';
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { Hash, Search, Plus } from 'lucide-react';

export default function NumbersPage() {
  const [myNumbers, setMyNumbers] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [purchasing, setPurchasing] = useState('');
  const [country, setCountry] = useState('US');
  const [type, setType] = useState('local');
  const [areaCode, setAreaCode] = useState('');
  const [tab, setTab] = useState<'my' | 'search'>('my');

  useEffect(() => {
    apiClient.get('/numbers')
      .then(r => setMyNumbers(r.data.data || r.data || []))
      .catch(() => setMyNumbers([]));
  }, []);

  const searchNumbers = async () => {
    setSearching(true);
    try {
      const r = await apiClient.get('/numbers/search', { params: { country, type, areaCode } });
      setSearchResults(r.data.data || r.data || []);
      setTab('search');
    } catch { setSearchResults([]); }
    finally { setSearching(false); }
  };

  const purchaseNumber = async (phoneNumber: string) => {
    setPurchasing(phoneNumber);
    try {
      await apiClient.post('/numbers/purchase', { phoneNumber, country, type });
      const r = await apiClient.get('/numbers');
      setMyNumbers(r.data.data || r.data || []);
      setTab('my');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Purchase failed — add Twilio credentials');
    } finally { setPurchasing(''); }
  };

  const statusColor: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
    suspended: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
    porting: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Phone Numbers</h1>

      {/* Search */}
      <div className="bg-card rounded-2xl border p-5 shadow-sm">
        <h2 className="font-semibold mb-4 flex items-center gap-2"><Search className="w-4 h-4" /> Search Available Numbers</h2>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Country</label>
            <select value={country} onChange={e => setCountry(e.target.value)}
              className="border rounded-xl px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="US">🇺🇸 US</option>
              <option value="GB">🇬🇧 UK</option>
              <option value="CA">🇨🇦 Canada</option>
              <option value="AU">🇦🇺 Australia</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Type</label>
            <select value={type} onChange={e => setType(e.target.value)}
              className="border rounded-xl px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="local">Local</option>
              <option value="toll_free">Toll-Free</option>
              <option value="mobile">Mobile</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Area Code</label>
            <input value={areaCode} onChange={e => setAreaCode(e.target.value)} maxLength={3}
              className="w-28 border rounded-xl px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground"
              placeholder="e.g. 212" />
          </div>
          <button onClick={searchNumbers} disabled={searching}
            className="px-6 py-2 rounded-xl font-semibold text-primary-foreground disabled:opacity-50 transition-all"
            style={{background: 'linear-gradient(135deg, hsl(230 85% 58%) 0%, hsl(250 75% 62%) 100%)'}}>
            {searching ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary rounded-xl p-1 w-fit">
        {(['my', 'search'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
            {t === 'my' ? `My Numbers (${myNumbers.length})` : `Results (${searchResults.length})`}
          </button>
        ))}
      </div>

      {/* My Numbers */}
      {tab === 'my' && (
        <div className="bg-card rounded-2xl border shadow-sm divide-y">
          {myNumbers.length === 0 ? (
            <div className="p-12 text-center">
              <Hash className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-30" />
              <p className="text-muted-foreground text-sm">No numbers yet. Search and purchase one above.</p>
            </div>
          ) : myNumbers.map((n: any) => (
            <div key={n.id} className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Hash className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold">{n.number}</span>
                  <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${statusColor[n.status] || 'bg-secondary text-secondary-foreground'}`}>{n.status}</span>
                  <span className="text-muted-foreground text-xs">{n.type}</span>
                </div>
                <div className="text-muted-foreground text-sm">{n.countryCode} • ${n.monthlyCost || '1.00'}/mo</div>
              </div>
              <button className="px-3 py-1.5 rounded-lg border text-sm hover:bg-accent transition-colors">
                Routing
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search Results */}
      {tab === 'search' && (
        <div className="bg-card rounded-2xl border shadow-sm divide-y">
          {searchResults.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-muted-foreground text-sm">Run a search to see available numbers</p>
            </div>
          ) : searchResults.map((n: any) => (
            <div key={n.number || n.phoneNumber} className="p-4 flex items-center gap-4">
              <div className="flex-1">
                <div className="font-semibold">{n.number || n.phoneNumber}</div>
                <div className="text-muted-foreground text-sm">{n.locality || n.region}, {n.countryCode} • {n.type}</div>
              </div>
              <div className="font-medium">${n.monthlyCost || '1.00'}/mo</div>
              <button onClick={() => purchaseNumber(n.number || n.phoneNumber)} disabled={purchasing === (n.number || n.phoneNumber)}
                className="px-4 py-2 rounded-xl text-primary-foreground text-sm font-medium disabled:opacity-50 transition-all flex items-center gap-1"
                style={{background: 'linear-gradient(135deg, hsl(230 85% 58%) 0%, hsl(250 75% 62%) 100%)'}}>
                <Plus className="w-3 h-3" />
                {purchasing === (n.number || n.phoneNumber) ? 'Buying...' : 'Purchase'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
