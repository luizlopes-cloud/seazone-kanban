import { Sidebar } from '@/components/layout/Sidebar'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Pipe } from '@/types/domain'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

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
