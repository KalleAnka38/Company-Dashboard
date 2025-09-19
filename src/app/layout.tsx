import React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import 'react-toastify/dist/ReactToastify.css';
import { SecurityProvider } from '@/lib/security/SecurityContext';
import { AuthProvider } from '@/components/auth/AuthContext';
const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600']
});
export const metadata: Metadata = {
  title: 'Company Finder',
  description: 'Find and analyze companies based on various metrics'
};
export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <html lang="en">
      <head>
        {/* Enhanced security headers */}
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <meta httpEquiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.example.com; font-src 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; base-uri 'self'" />
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta httpEquiv="Permissions-Policy" content="camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=(), accelerometer=(), gyroscope=(), ambient-light-sensor=()" />
        <meta httpEquiv="Strict-Transport-Security" content="max-age=31536000; includeSubDomains; preload" />
      </head>
      <body className={`${inter.className} min-h-screen bg-black text-white`}>
        <AuthProvider>
          <SecurityProvider>
            {children}
            <footer className="bg-gray-900 border-t border-gray-800 py-4">
              <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} Company Finder - All rights
                reserved
              </div>
            </footer>
          </SecurityProvider>
        </AuthProvider>
      </body>
    </html>;
}