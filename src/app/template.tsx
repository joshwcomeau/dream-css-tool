import type { Metadata } from 'next';

import StyleRegistry from '@/components/StyleRegistry';

export const metadata: Metadata = {
  title: 'Dream CSS tool',
};

export default function RootTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StyleRegistry>
      {children}
    </StyleRegistry>
  );
}
