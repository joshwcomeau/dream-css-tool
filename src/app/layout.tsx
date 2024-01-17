import type { Metadata } from 'next';

import StyleRegistry from '@/components/StyleRegistry';

export const metadata: Metadata = {
  title: 'Dream CSS tool',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StyleRegistry>
      <html lang="en">
        <body>{children}</body>
      </html>
    </StyleRegistry>
  );
}
