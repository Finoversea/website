'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  Target,
  Bell,
  Tags,
  Settings,
  Database,
  Menu,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const sidebarItems = [
  {
    title: '仪表盘',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: '采集任务',
    href: '/collection-tasks',
    icon: Target,
  },
  {
    title: '信息项管理',
    href: '/information-items',
    icon: FileText,
  },
  {
    title: '订阅管理',
    href: '/subscriptions',
    icon: Bell,
  },
  {
    title: '标签管理',
    href: '/tags',
    icon: Tags,
  },
  {
    title: '推送通知',
    href: '/notifications',
    icon: Database,
  },
  {
    title: '系统设置',
    href: '/settings',
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Menu className="h-6 w-6" />
          <span>FinOversea 管理端</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {sidebarItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
              pathname === item.href
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.title}
          </Link>
        ))}
      </nav>
    </div>
  )
}