import type { Metadata } from 'next'
import { Providers } from './providers'
import '../index.css'

export const metadata: Metadata = {
  title: 'TaskFlow',
  description: 'Task management app',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
