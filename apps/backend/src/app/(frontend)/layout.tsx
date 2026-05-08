import type { ReactNode } from 'react'

export const metadata = {
  title: 'Attendance QR Backend',
  description: 'Next.js and PayloadCMS backend for QR attendance verification',
}

export default function FrontendLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  )
}
