import type { Metadata } from 'next';
import { Space_Grotesk, Syne, DM_Mono } from 'next/font/google';
import './globals.css';
import BottomNav from '@/components/BottomNav';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space' });
const syne = Syne({ subsets: ['latin'], variable: '--font-syne' });
const dmMono = DM_Mono({ weight: ['400', '500'], subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'JessCRM',
  description: 'Gestão diária de tarefas e contatos',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black',
    title: 'JessCRM',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <meta name="theme-color" content="#000000" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('App Pronto para Uso Offline!');
                    },
                    function(err) {
                      console.log('SW registration failed: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </head>
      <body className={`${spaceGrotesk.variable} ${syne.variable} ${dmMono.variable} font-sans antialiased min-h-screen flex flex-col`}>
        <div className="flex-1 flex flex-col pb-20">
          {children}
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
