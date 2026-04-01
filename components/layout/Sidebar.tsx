'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Pipe } from '@/types/domain'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface SidebarProps {
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

export function Sidebar({ pipes }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="w-56 flex-shrink-0 border-r bg-card flex flex-col">
      {/* Logo */}
      <div className="px-4 py-4 border-b">
        <h1 className="font-bold text-sm tracking-wide text-foreground">Seazone Kanban</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Gestão operacional</p>
      </div>

      {/* Pipes nav */}
      <nav className="flex-1 py-2 overflow-y-auto">
        <p className="px-4 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Funis
        </p>
        {pipes.map((pipe) => {
          const isActive = pathname === `/pipe/${pipe.slug}`
          return (
            <Link
              key={pipe.id}
              href={`/pipe/${pipe.slug}`}
              className={cn(
                'flex items-center gap-2.5 px-4 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: pipe.color }}
              />
              <span className="truncate">
                {PIPE_ICONS[pipe.slug] ?? '📋'} {pipe.name.replace(/^PIPE \d+ - /, '')}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t p-3">
        <button
          onClick={handleSignOut}
          className="w-full text-left text-xs text-muted-foreground hover:text-foreground transition-colors px-1 py-1"
        >
          Sair
        </button>
      </div>
    </aside>
  )
}
