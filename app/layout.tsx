// app/layout.tsx
import './globals.css';
import Navbar from '@/components/Navbar';
import StoreProvider from '@/app/providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          <Navbar />
          <main>{children}</main>
        </StoreProvider>
      </body>
    </html>
  );
}