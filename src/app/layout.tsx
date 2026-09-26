import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { InventoryProvider } from '@/context/InventoryContext';
import { ThemeProvider } from '@/context/ThemeContext';
import Navbar from '@/components/Navbar';
import DemoDataWidget from '@/components/DemoDataWidget';

const jakartaSans = Plus_Jakarta_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'StockSense — Centralized Real-Time Inventory & WMS',
  description: 'Next-generation warehouse and inventory management system with real-time double-entry stock ledger, automated sequence generation, and barcode scanning.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('stocksense_theme');
                  if (saved === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                    document.documentElement.style.colorScheme = 'dark';
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('light');
                    document.documentElement.style.colorScheme = 'light';
                  }
                } catch (e) {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.classList.add('light');
                  document.documentElement.style.colorScheme = 'light';
                }
              })();
            `,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${jakartaSans.variable} ${jetbrainsMono.variable} antialiased bg-slate-50 text-slate-900 dark:bg-[#080b14] dark:text-slate-100 min-h-screen flex flex-col selection:bg-indigo-500/30 selection:text-indigo-600 dark:selection:text-indigo-200 transition-colors duration-200`}
      >
        <ClerkProvider dynamic>
          <ThemeProvider>
            <InventoryProvider>
              <Navbar />
              <DemoDataWidget />
              <main className="flex-1 w-full animate-page-enter">{children}</main>
            </InventoryProvider>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}

