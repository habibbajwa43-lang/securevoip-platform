import type { Metadata } from 'next';
import './globals.css';

const PORTAL_URL = process.env.NEXT_PUBLIC_PORTAL_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'SecureVoIP — Enterprise Communication Platform',
  description: 'Enterprise-grade VoIP, SMS, and communication platform. HD voice calling, global numbers, and secure messaging for businesses worldwide.',
  keywords: 'VoIP, business phone, SMS, enterprise communication, cloud calling',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white antialiased">
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-gray-950/80 backdrop-blur-xl">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2 font-bold text-xl">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-sm">📞</span>
              SecureVoIP
            </a>
            <div className="hidden md:flex items-center gap-8 text-sm text-gray-300">
              <a href="/" className="hover:text-white transition-colors">Features</a>
              <a href="/pricing" className="hover:text-white transition-colors">Pricing</a>
              <a href="/contact" className="hover:text-white transition-colors">Contact</a>
            </div>
            <div className="flex items-center gap-4">
              <a href={`${PORTAL_URL}/auth/login`} className="text-sm text-gray-300 hover:text-white transition-colors">
                Sign In
              </a>
              <a href={`${PORTAL_URL}/auth/register`}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">
                Get Started Free
              </a>
            </div>
          </div>
        </nav>
        <div className="pt-16">{children}</div>
        <footer className="border-t border-white/10 py-12 mt-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 font-bold text-lg mb-4">
                  <span className="w-7 h-7 rounded-md bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-xs">📞</span>
                  SecureVoIP
                </div>
                <p className="text-gray-400 text-sm">Enterprise communication for modern businesses.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-sm">Product</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><a href="/" className="hover:text-white transition-colors">Features</a></li>
                  <li><a href="/pricing" className="hover:text-white transition-colors">Pricing</a></li>
                  <li><a href={`${PORTAL_URL}/auth/register`} className="hover:text-white transition-colors">Get Started</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-sm">Company</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
                  <li><a href="/contact" className="hover:text-white transition-colors">Support</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-sm">Legal</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-white/10 pt-8 text-center text-gray-500 text-sm">
              © {new Date().getFullYear()} SecureVoIP. All rights reserved.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
