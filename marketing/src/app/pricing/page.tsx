import Link from 'next/link';

const plans = [
  {
    name: 'Starter', price: 0, desc: 'Perfect for individuals and small teams',
    features: ['1 phone number', '100 mins/month voice', '500 SMS/month', 'Basic call routing', 'Web portal access', 'Email support'],
    cta: 'Start Free', highlighted: false,
  },
  {
    name: 'Business', price: 29, desc: 'For growing businesses that need more',
    features: ['5 phone numbers', '2,000 mins/month voice', '5,000 SMS/month', 'Advanced routing & IVR', 'Mobile apps (iOS + Android)', 'Call recording', 'Analytics dashboard', 'Priority support'],
    cta: 'Start Trial', highlighted: true,
  },
  {
    name: 'Enterprise', price: 99, desc: 'For large teams with custom needs',
    features: ['Unlimited numbers', 'Unlimited voice minutes', 'Unlimited SMS', 'Custom SIP trunking', 'Dedicated account manager', 'SLA guarantee (99.99%)', 'Custom integrations', 'White-labeling', '24/7 phone support'],
    cta: 'Contact Sales', highlighted: false,
  },
];

const usage = [
  { item: 'Outbound calls (US/Canada)', rate: '$0.020/min' },
  { item: 'Inbound calls', rate: '$0.010/min' },
  { item: 'SMS (outbound)', rate: '$0.0075/msg' },
  { item: 'MMS (outbound)', rate: '$0.020/msg' },
  { item: 'Local number', rate: '$1.00/month' },
  { item: 'Toll-free number', rate: '$2.00/month' },
];

export default function PricingPage() {
  return (
    <main className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">Simple, transparent pricing</h1>
          <p className="text-gray-400 text-xl">Start free, scale as you grow. No hidden fees.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {plans.map(plan => (
            <div key={plan.name}
              className={`rounded-2xl p-8 border ${plan.highlighted ? 'border-indigo-500 bg-indigo-600/10 relative' : 'border-white/10 bg-gray-900/50'}`}>
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-indigo-600 rounded-full text-xs font-bold text-white">
                  MOST POPULAR
                </div>
              )}
              <h2 className="text-xl font-bold text-white mb-1">{plan.name}</h2>
              <p className="text-gray-400 text-sm mb-6">{plan.desc}</p>
              <div className="mb-8">
                <span className="text-5xl font-bold text-white">${plan.price}</span>
                <span className="text-gray-400">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-gray-300 text-sm">
                    <span className="text-green-400 flex-shrink-0">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link href="http://localhost:3001/auth/register"
                className={`block w-full py-3 rounded-xl text-center font-semibold transition-colors ${plan.highlighted ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'border border-white/20 text-white hover:bg-white/5'}`}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Usage rates */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Pay-as-you-go rates</h2>
          <div className="bg-gray-900/50 border border-white/10 rounded-2xl overflow-hidden">
            {usage.map((u, i) => (
              <div key={u.item} className={`flex items-center justify-between px-6 py-4 ${i < usage.length - 1 ? 'border-b border-white/5' : ''}`}>
                <span className="text-gray-300">{u.item}</span>
                <span className="text-indigo-400 font-semibold">{u.rate}</span>
              </div>
            ))}
          </div>
          <p className="text-gray-500 text-sm text-center mt-4">All rates are in USD. Volume discounts available for Enterprise plans.</p>
        </div>
      </div>
    </main>
  );
}
