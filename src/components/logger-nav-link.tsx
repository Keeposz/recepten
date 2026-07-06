'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'

export function LoggerNavLink() {
  const pathname = usePathname()
  const active = pathname === '/logger'
  return (
    <Link
      href="/logger"
      aria-current={active ? 'page' : undefined}
      className={cn(
        'rounded-md border-2 px-2.5 py-1 whitespace-nowrap',
        active
          ? 'border-foreground bg-foreground text-background'
          : 'border-transparent hover:border-foreground hover:bg-accent/10',
      )}
    >
      Logger
    </Link>
  )
}
