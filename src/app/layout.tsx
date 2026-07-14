import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'METLIFE STADIUM | FIFA World Cup 2026 AI Hub',
  description: 'A GenAI-enabled stadium operations and fan experience platform for the FIFA World Cup 2026. Enhancing safety, accessibility, navigation, and green transit.',
  keywords: 'FIFA World Cup 2026, Smart Stadium, GenAI, Tournament Operations, Fan Experience, Accessibility, Sustainability, Crowd Management',
  authors: [{ name: 'Antigravity AI' }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
