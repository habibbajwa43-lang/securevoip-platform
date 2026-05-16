import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SecureVoIP — Admin Panel',
  description: 'System administration for SecureVoIP Platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-gray-950 text-white">
        <div className="flex h-screen">
          <aside className="w-64 bg-gray-900 border-r border-white/10 flex flex-col">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-sm">🛡️</div>
                <div>
                  <h1 className="text-sm font-bold text-white">Admin Panel</h1>
                  <p className="text-gray-400 text-xs">SecureVoIP</p>
                </div>
              </div>
            </div>
            <nav className="flex-1 p-4 space-y-1">
              {[
                { href: '/', icon: '📊', label: 'Dashboard' },
                { href: '/users', icon: '👥', label: 'Users' },
                { href: '/numbers', icon: '📞', label: 'Numbers' },
                { href: '/billing', icon: '💰', label: 'Billing' },
                { href: '/monitoring', icon: '📡', label: 'Monitoring' },
                { href: '/reports', icon: '📈', label: 'Reports' },
                { href: '/config', icon: '⚙️', label: 'Configuration' },
              ].map(item => (
                <a key={item.href} href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors text-sm">
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </a>
              ))}
            </nav>
            <div className="p-4 border-t border-white/10">
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-800">
                <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold">SA</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">Super Admin</p>
                  <p className="text-xs text-gray-400 truncate">admin@voipplatform.com</p>
                </div>
              </div>
            </div>
          </aside>
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}
