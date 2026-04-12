import { Inter } from 'next/font/google';
import './globals.css';
import ClientProviders from '../components/ClientProviders';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: 'AuthApp — Secure Authentication & Dashboard',
  description:
    'A production-ready full-stack authentication system with JWT, password reset, and a CRUD dashboard.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-slate-950 text-slate-100 antialiased">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
