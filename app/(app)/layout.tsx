import { Sidebar } from '@/components/layout/Sidebar'
import { createClient } from '@/lib/supabase/server'
import type { Pipe } from '@/types/domain'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const { data: pipes } = await supabase
    .from('pipes')
    .select('*')
    .order('position')

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar pipes={(pipes ?? []) as Pipe[]} />
      <main className="flex-1 overflow-hidden flex flex-col">
        {children}
      </main>
    </div>
  )
}
