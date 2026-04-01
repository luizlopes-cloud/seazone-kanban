import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { KanbanBoard } from '@/components/kanban/KanbanBoard'
import type { BoardData, Pipe, Phase, Card, PipeField } from '@/types/domain'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function PipePage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  // Load pipe
  const { data: pipe } = await supabase
    .from('pipes')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!pipe) notFound()

  // Load phases, cards, and fields in parallel
  const [{ data: phases }, { data: cards }, { data: fields }] = await Promise.all([
    supabase
      .from('phases')
      .select('*')
      .eq('pipe_id', pipe.id)
      .order('position'),
    supabase
      .from('cards')
      .select('*')
      .eq('pipe_id', pipe.id)
      .order('position'),
    supabase
      .from('pipe_fields')
      .select('*')
      .eq('pipe_id', pipe.id)
      .order('position'),
  ])

  const boardData: BoardData = {
    pipe: pipe as unknown as Pipe,
    phases: (phases ?? []) as unknown as Phase[],
    cards: (cards ?? []) as unknown as Card[],
    fields: (fields ?? []) as unknown as PipeField[],
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b shrink-0">
        <div>
          <h2 className="font-semibold text-lg">{pipe.name.replace(/^PIPE \d+ - /, '')}</h2>
          <p className="text-xs text-muted-foreground">
            {cards?.length ?? 0} cards · {phases?.length ?? 0} fases
          </p>
        </div>
      </div>
      {/* Board */}
      <KanbanBoard data={boardData} />
    </div>
  )
}
