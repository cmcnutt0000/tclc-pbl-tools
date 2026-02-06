import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TCLC PBL Tools',
  description: 'Project-Based Learning Design Tools by Third Coast Learning Collaborative',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
