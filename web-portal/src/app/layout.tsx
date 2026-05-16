import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
// @ts-expect-error CSS import type declarations are managed outside this file
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SecureVoIP — Enterprise Communications',
  description: 'Enterprise-grade VoIP platform for calls, SMS, and number management',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
          
        </Providers>
      </body>
    </html>
  );
}


