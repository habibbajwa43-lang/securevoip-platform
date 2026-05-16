import Link from 'next/link';

const PORTAL_URL = process.env.NEXT_PUBLIC_PORTAL_URL || 'http://localhost:3000';

const features = [
  { icon: '📞', title: 'Crystal-Clear VoIP Calls', desc: 'HD voice calling with adaptive codecs for low-latency communication across WiFi and mobile networks.' },
  { icon: '💬', title: 'SMS & MMS Messaging', desc: 'Send and receive text messages globally. Schedule messages, bulk sends, and MMS support included.' },
  { icon: '🌍', title: 'Global Phone Numbers', desc: 'Provision numbers in 50+ countries instantly. Port existing numbers with zero downtime.' },
  { icon: '🔒', title: 'Enterprise Security', desc: 'AES-256 encryption, JWT auth, PIN login, QR code sign-in, and VAPT-tested infrastructure.' },
  { icon: '💰', title: 'Pay-As-You-Go Billing', desc: 'Prepaid wallet model with Stripe. No monthly surprises. Top up anytime, use what you need.' },
  { icon: '📱', title: 'iOS & Android Apps', desc: 'Native mobile apps with push notifications, background calling, and seamless sync.' },
];

const stats = [
  { value: '99.99%', label: 'Uptime SLA' },
  { value: '50+', label: 'Countries' },
  { value: '<20ms', label: 'Call Latency' },
  { value: '10M+', label: 'Calls/Month' },
];

const testimonials = [
  { name: 'Sarah Johnson', role: 'CTO, TechCorp', text: 'SecureVoIP transformed our remote team communication. Crystal clear calls and rock-solid reliability.' },
  { name: 'Ahmed Hassan', role: 'CEO, GlobalBiz', text: 'The best VoIP solution we have used. Simple pricing, powerful features, and excellent support.' },
  { name: 'Maria Garcia', role: 'Operations, StartupX', text: 'Setup took 5 minutes. We were making calls across 3 countries the same day. Incredible.' },
];

export default function HomePage() {
  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden py-32 px-6">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/50 via-gray-950 to-pink-950/30 pointer-events-none" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Enterprise VoIP Platform — Now Available
          </div>
          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
            <span className="gradient-text">Business Calls.</span><br />
            Reimagined.
          </h1>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Cloud VoIP, SMS, and local numbers for businesses worldwide. HD voice, sub-20ms latency, and enterprise security — all in one platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href={`${PORTAL_URL}/auth/register`}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-pink-600 text-white font-semibold text-lg hover:opacity-90 transition-opacity glow">
              Start Free Trial →
            </a>
            <a href="/pricing"
              className="px-8 py-4 rounded-xl border border-white/20 text-white font-semibold text-lg hover:border-white/40 hover:bg-white/5 transition-all">
              See Pricing
            </a>
          </div>
          <p className="text-gray-500 text-sm mt-4">No credit card required · Setup in 5 minutes · Cancel anytime</p>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-white/10 bg-white/5 py-12">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map(s => (
            <div key={s.label}>
              <div className="text-3xl font-bold gradient-text">{s.value}</div>
              <div className="text-gray-400 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything your team needs</h2>
            <p className="text-gray-400 text-lg">One platform for all your business communication needs</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(f => (
              <div key={f.title} className="bg-gray-900/50 border border-white/10 rounded-2xl p-6 hover:border-indigo-500/50 transition-all duration-300 group hover:-translate-y-1">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-indigo-300 transition-colors">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-white/5 border-y border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Trusted by businesses worldwide</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <div key={t.name} className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                <p className="text-gray-300 text-sm leading-relaxed mb-6">"{t.text}"</p>
                <div>
                  <p className="text-white font-semibold text-sm">{t.name}</p>
                  <p className="text-gray-400 text-xs">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-indigo-600/20 to-pink-600/20 border border-white/10 rounded-3xl p-12">
          <h2 className="text-4xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-gray-300 text-lg mb-8">No credit card required. Set up in under 5 minutes.</p>
          <a href={`${PORTAL_URL}/auth/register`}
            className="inline-block px-10 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-pink-600 text-white font-bold text-lg hover:opacity-90 transition-opacity glow">
            Create Free Account →
          </a>
        </div>
      </section>
    </main>
  );
}
