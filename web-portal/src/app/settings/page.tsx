'use client';
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { User, Bell, Shield, Moon } from 'lucide-react';

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const [profile, setProfile] = useState({ firstName: '', lastName: '', timezone: 'UTC', language: 'en' });
  const [dnd, setDnd] = useState({ enabled: false, startTime: '22:00', endTime: '08:00', days: [] as string[] });
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [tab, setTab] = useState<'profile' | 'dnd' | 'security' | 'notifications'>('profile');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (user) setProfile({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      timezone: (user as any).timezone || 'UTC',
      language: (user as any).language || 'en',
    });
  }, [user]);

  const showMsg = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const r = await apiClient.put('/users/me', profile);
      updateUser(r.data.data || r.data);
      showMsg('Profile updated!');
    } catch { showMsg('Failed to save'); }
    finally { setSaving(false); }
  };

  const saveDnd = async () => {
    setSaving(true);
    try {
      await apiClient.put('/users/me/dnd', dnd);
      showMsg('DND schedule saved!');
    } catch { showMsg('Failed to save'); }
    finally { setSaving(false); }
  };

  const changePassword = async () => {
    if (passwords.new !== passwords.confirm) { showMsg('Passwords do not match'); return; }
    setSaving(true);
    try {
      await apiClient.put('/users/me/password', { currentPassword: passwords.current, newPassword: passwords.new });
      setPasswords({ current: '', new: '', confirm: '' });
      showMsg('Password changed!');
    } catch { showMsg('Failed to change password'); }
    finally { setSaving(false); }
  };

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const tabs = [
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'dnd', label: 'Do Not Disturb', icon: Moon },
    { key: 'security', label: 'Security', icon: Shield },
    { key: 'notifications', label: 'Notifications', icon: Bell },
  ] as const;

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight">Settings</h1>

      {msg && (
        <div className="p-3 bg-primary/10 border border-primary/30 rounded-xl text-primary text-sm font-medium">
          {msg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary rounded-xl p-1">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${tab === t.key ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
            <t.icon className="w-3.5 h-3.5" />
            <span className="hidden sm:block">{t.label}</span>
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="bg-card rounded-2xl border p-6 space-y-4 shadow-sm">
          <h2 className="font-semibold">Profile Information</h2>
          <div className="grid grid-cols-2 gap-4">
            {(['firstName', 'lastName'] as const).map(f => (
              <div key={f}>
                <label className="block text-xs text-muted-foreground mb-1 capitalize">{f === 'firstName' ? 'First Name' : 'Last Name'}</label>
                <input value={profile[f]} onChange={e => setProfile(p => ({ ...p, [f]: e.target.value }))}
                  className="w-full border rounded-xl px-4 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Timezone</label>
            <select value={profile.timezone} onChange={e => setProfile(p => ({ ...p, timezone: e.target.value }))}
              className="w-full border rounded-xl px-4 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm">
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern (ET)</option>
              <option value="America/Los_Angeles">Pacific (PT)</option>
              <option value="Europe/London">London (GMT)</option>
              <option value="Asia/Karachi">Karachi (PKT)</option>
            </select>
          </div>
          <button onClick={saveProfile} disabled={saving}
            className="px-6 py-2.5 rounded-xl text-primary-foreground font-medium disabled:opacity-50 transition-all"
            style={{background: 'linear-gradient(135deg, hsl(230 85% 58%) 0%, hsl(250 75% 62%) 100%)'}}>
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      )}

      {tab === 'dnd' && (
        <div className="bg-card rounded-2xl border p-6 space-y-4 shadow-sm">
          <h2 className="font-semibold">Do Not Disturb</h2>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm font-medium">Enable DND Schedule</span>
            <button onClick={() => setDnd(d => ({ ...d, enabled: !d.enabled }))}
              className={`relative w-12 h-6 rounded-full transition-colors ${dnd.enabled ? 'bg-primary' : 'bg-secondary border'}`}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${dnd.enabled ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
          {dnd.enabled && (
            <>
              <div className="grid grid-cols-2 gap-4">
                {(['startTime', 'endTime'] as const).map(f => (
                  <div key={f}>
                    <label className="block text-xs text-muted-foreground mb-1">{f === 'startTime' ? 'Start' : 'End'} Time</label>
                    <input type="time" value={dnd[f]} onChange={e => setDnd(d => ({ ...d, [f]: e.target.value }))}
                      className="w-full border rounded-xl px-4 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-2">Active Days</label>
                <div className="flex gap-2 flex-wrap">
                  {days.map(d => (
                    <button key={d} onClick={() => setDnd(s => ({
                      ...s, days: s.days.includes(d) ? s.days.filter(x => x !== d) : [...s.days, d]
                    }))}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${dnd.days.includes(d) ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border hover:bg-accent'}`}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
          <button onClick={saveDnd} disabled={saving}
            className="px-6 py-2.5 rounded-xl text-primary-foreground font-medium disabled:opacity-50"
            style={{background: 'linear-gradient(135deg, hsl(230 85% 58%) 0%, hsl(250 75% 62%) 100%)'}}>
            {saving ? 'Saving...' : 'Save DND Settings'}
          </button>
        </div>
      )}

      {tab === 'security' && (
        <div className="bg-card rounded-2xl border p-6 space-y-4 shadow-sm">
          <h2 className="font-semibold">Change Password</h2>
          {[
            { key: 'current', label: 'Current Password' },
            { key: 'new', label: 'New Password' },
            { key: 'confirm', label: 'Confirm New Password' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs text-muted-foreground mb-1">{f.label}</label>
              <input type="password" value={passwords[f.key as keyof typeof passwords]}
                onChange={e => setPasswords(p => ({ ...p, [f.key]: e.target.value }))}
                className="w-full border rounded-xl px-4 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
            </div>
          ))}
          <button onClick={changePassword} disabled={saving}
            className="px-6 py-2.5 rounded-xl text-primary-foreground font-medium disabled:opacity-50"
            style={{background: 'linear-gradient(135deg, hsl(230 85% 58%) 0%, hsl(250 75% 62%) 100%)'}}>
            {saving ? 'Changing...' : 'Change Password'}
          </button>
        </div>
      )}

      {tab === 'notifications' && (
        <div className="bg-card rounded-2xl border p-6 space-y-2 shadow-sm">
          <h2 className="font-semibold mb-4">Notification Preferences</h2>
          {[
            { label: 'Incoming Calls', desc: 'Push notification for incoming calls', on: true },
            { label: 'Missed Calls', desc: 'Notification when you miss a call', on: true },
            { label: 'New Messages', desc: 'SMS/MMS notifications', on: true },
            { label: 'Low Balance', desc: 'Alert when balance falls below $5', on: false },
            { label: 'Invoices', desc: 'Billing and payment notifications', on: true },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between py-3 border-b last:border-0">
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-muted-foreground text-xs">{item.desc}</p>
              </div>
              <div className={`relative w-10 h-5 rounded-full cursor-pointer transition-colors ${item.on ? 'bg-primary' : 'bg-secondary border'}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${item.on ? 'left-5' : 'left-0.5'}`} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
