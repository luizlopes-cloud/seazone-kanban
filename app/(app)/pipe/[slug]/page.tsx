import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { KanbanBoard } from '@/components/kanban/KanbanBoard'
import type { BoardData, Pipe, Phase, Card, PipeField } from '@/types/domain'

interface Props {
  params: { slug: string }
}

export default async function PipePage({ params }: Props) {
  const { slug } = params.slug
  const supabase = await createClient()

  // Load pipe
  const { data: pipe, error: pipeError } = await supabase
    .from('pipes')
    .select('*')
    .eq('slug', slug)
    .single()

  if (pipeError || !pipe) {
    notFound()
    return;
  }

  // Load phases, cards, and fields in parallel
  const [{ data: phases, error: phasesError }, { data: cards, error: cardsError }, { data: fields, error: fieldsError }] = await Promise.all([
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

  if (phasesError || cardsError || fieldsError) {
    console.error("Error fetching data:", { phasesError, cardsError, fieldsError });
    let errorMessage = "Erro ao carregar os dados do pipe. Por favor, tente novamente mais tarde.";

    if (phasesError) {
      errorMessage += ` Detalhes do erro nas fases: ${phasesError.message || phasesError.details || 'Erro desconhecido'}.`;
    }
    if (cardsError) {
      errorMessage += ` Detalhes do erro nos cards: ${cardsError.message || cardsError.details || 'Erro desconhecido'}.`;
    }
    if (fieldsError) {
      errorMessage += ` Detalhes do erro nos campos: ${fieldsError.message || fieldsError.details || 'Erro desconhecido'}.`;
    }

    return (
      <div>
        <p>{errorMessage}</p>
      </div>
    );
  }

  const boardData: BoardData = {
    pipe: pipe as Pipe,
    phases: (phases ?? []) as Phase[],
    cards: (cards ?? []) as Card[],
    fields: (fields ?? []) as PipeField[],
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