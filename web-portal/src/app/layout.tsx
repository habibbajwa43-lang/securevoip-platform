import type { Metadata } from 'next';
// @ts-expect-error CSS import type declarations are managed outside this file
import './globals.css';
import { Providers } from './providers';


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
      <body>
        <Providers>
          {children}
          
        </Providers>
      </body>
    </html>
  );
}



