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
          : 'border-foreground bg-background hover:bg-accent hover:text-accent-foreground',
      )}
    >
      Logger
    </Link>
  )
}
