'use client';
import { useState } from 'react';

export default function ConfigPage() {
  const [config, setConfig] = useState({
    callRatePerMin: '0.020',
    smsRatePerMsg: '0.0075',
    localNumberMonthly: '1.00',
    tollFreeMonthly: '2.00',
    minTopUp: '5',
    maxTopUp: '500',
    lowBalanceAlert: '5',
    autoSuspendDays: '30',
    maxFailedLogins: '5',
    sessionTimeout: '15',
    maintenanceMode: false,
    registrationOpen: true,
    twilioEnabled: true,
    stripeEnabled: true,
  });

  const [saved, setSaved] = useState(false);

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const Field = ({ label, k, type = 'text' }: { label: string; k: keyof typeof config; type?: string }) => (
    <div>
      <label className="block text-sm text-gray-400 mb-1">{label}</label>
      {type === 'toggle' ? (
        <button onClick={() => setConfig(c => ({ ...c, [k]: !c[k] }))}
          className={`relative w-12 h-6 rounded-full transition-colors ${config[k] ? 'bg-indigo-600' : 'bg-gray-700 border border-white/20'}`}>
          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${config[k] ? 'left-7' : 'left-1'}`} />
        </button>
      ) : (
        <input value={config[k] as string} onChange={e => setConfig(c => ({ ...c, [k]: e.target.value }))}
          className="w-full bg-gray-800 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
      )}
    </div>
  );

  return (
    <div className="p-8 space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">System Configuration</h1>
        <button onClick={save}
          className={`px-6 py-2 rounded-lg font-medium text-sm transition-all ${saved ? 'bg-green-600 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
          {saved ? '✓ Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="card space-y-4">
        <h2 className="text-white font-semibold">Pricing & Rates</h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Call Rate (per minute $)" k="callRatePerMin" />
          <Field label="SMS Rate (per message $)" k="smsRatePerMsg" />
          <Field label="Local Number (monthly $)" k="localNumberMonthly" />
          <Field label="Toll-Free Number (monthly $)" k="tollFreeMonthly" />
        </div>
      </div>

      <div className="card space-y-4">
        <h2 className="text-white font-semibold">Billing Rules</h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Minimum Top-up ($)" k="minTopUp" />
          <Field label="Maximum Top-up ($)" k="maxTopUp" />
          <Field label="Low Balance Alert ($)" k="lowBalanceAlert" />
          <Field label="Auto-suspend after (days)" k="autoSuspendDays" />
        </div>
      </div>

      <div className="card space-y-4">
        <h2 className="text-white font-semibold">Security</h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Max Failed Logins" k="maxFailedLogins" />
          <Field label="Session Timeout (minutes)" k="sessionTimeout" />
        </div>
      </div>

      <div className="card space-y-4">
        <h2 className="text-white font-semibold">System Toggles</h2>
        <div className="space-y-4">
          {[
            { label: 'Maintenance Mode', k: 'maintenanceMode' as const, desc: 'Block all user access' },
            { label: 'Open Registration', k: 'registrationOpen' as const, desc: 'Allow new signups' },
            { label: 'Twilio Integration', k: 'twilioEnabled' as const, desc: 'Enable calls & SMS' },
            { label: 'Stripe Payments', k: 'stripeEnabled' as const, desc: 'Enable wallet top-ups' },
          ].map(item => (
            <div key={item.k} className="flex items-center justify-between py-2 border-b border-white/5">
              <div>
                <p className="text-white text-sm font-medium">{item.label}</p>
                <p className="text-gray-400 text-xs">{item.desc}</p>
              </div>
              <Field label="" k={item.k} type="toggle" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
