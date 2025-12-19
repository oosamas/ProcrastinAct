import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ProcrastinAct - Start Tasks, Not Guilt',
  description:
    'The go-to app for neurodivergent people who struggle with task initiation and time awareness. AI-powered task shrinking with ambient time visualization.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
