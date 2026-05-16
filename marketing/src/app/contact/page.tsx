'use client';
import { useState } from 'react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', company: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <main className="py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">Get in touch</h1>
          <p className="text-gray-400 text-xl">Our team is ready to help you get started</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact info */}
          <div className="space-y-8">
            {[
              { icon: '📧', title: 'Email', value: 'sales@voipplatform.com' },
              { icon: '📞', title: 'Phone', value: '+1 (555) 123-4567' },
              { icon: '💬', title: 'Live Chat', value: 'Available Mon–Fri, 9am–6pm EST' },
              { icon: '🌐', title: 'Global HQ', value: '123 Business Ave, San Francisco, CA' },
            ].map(item => (
              <div key={item.title} className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-xl flex-shrink-0">
                  {item.icon}
                </div>
                <div>
                  <p className="text-white font-semibold">{item.title}</p>
                  <p className="text-gray-400 mt-0.5">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-8">
            {sent ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="text-white text-xl font-bold mb-2">Message sent!</h3>
                <p className="text-gray-400">We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Name</label>
                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
                      className="w-full bg-gray-800 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                      placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Company</label>
                    <input value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                      className="w-full bg-gray-800 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                      placeholder="Acme Inc." />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Email</label>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required
                    className="w-full bg-gray-800 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                    placeholder="you@company.com" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Message</label>
                  <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} required rows={5}
                    className="w-full bg-gray-800 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none"
                    placeholder="Tell us about your needs..." />
                </div>
                <button type="submit"
                  className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors">
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
