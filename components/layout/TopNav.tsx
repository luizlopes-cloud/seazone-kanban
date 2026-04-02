'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import type { Pipe } from '@/types/domain'
import { cn } from '@/lib/utils'

interface Props {
  pipes: Pipe[]
}

const PIPE_ICONS: Record<string, string> = {
  onboarding:  '🏠',
  implantacao: '🔧',
  adequacao:   '🛋️',
  vistorias:   '🔍',
  fotos:       '📷',
  anuncios:    '📢',
}

export function TopNav({ pipes }: Props) {
  const pathname = usePathname()

  return (
    <header className="flex-shrink-0 border-b bg-card">
      <div className="flex items-center h-12 px-4 gap-0">
        {/* Pipe tabs */}
        <nav className="flex items-center gap-0.5 flex-1 overflow-x-auto scrollbar-none">
          {pipes.map((pipe) => {
            const isActive = pathname === `/pipe/${pipe.slug}`
            const label = pipe.name.replace(/^PIPE \d+ - /, '')
            return (
              <Link
                key={pipe.id}
                href={`/pipe/${pipe.slug}`}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm whitespace-nowrap transition-colors shrink-0',
                  isActive
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: pipe.color }}
                />
                {PIPE_ICONS[pipe.slug] ?? '📋'} {label}
              </Link>
            )
          })}
        </nav>

        {/* Seazone logo — right */}
        <div className="ml-4 flex-shrink-0">
          <Image
            src="/seazone-logo.svg"
            alt="Seazone"
            width={110}
            height={28}
            priority
          />
        </div>
      </div>
    </header>
  )
}
