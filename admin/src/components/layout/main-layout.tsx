'use client'

import { Sidebar } from './sidebar'

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="container py-6">{children}</div>
      </main>
    </div>
  )
}