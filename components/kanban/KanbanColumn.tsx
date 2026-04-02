'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { KanbanCard } from './KanbanCard'
import { cn } from '@/lib/utils'
import type { Phase, Card, PipeField } from '@/types/domain'
import { NewCardButton } from './NewCardButton'

interface Props {
  phase: Phase
  cards: Card[]
  fields: PipeField[]
  pipeId: string
}

export function KanbanColumn({ phase, cards, fields, pipeId }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: phase.id })

  return (
    <div className="flex flex-col flex-shrink-0 w-[260px]">
      {/* Column header */}
      <div className="flex items-center justify-between mb-2 px-0.5">
        <div className="flex items-center gap-1.5 min-w-0">
          {phase.is_standby && <span className="text-amber-500 text-xs">⏸</span>}
          {phase.is_done && <span className="text-emerald-500 text-xs">✓</span>}
          <span className="text-[13px] font-semibold truncate text-foreground">
            {phase.name}
          </span>
        </div>
        <span className="text-[11px] font-medium text-muted-foreground bg-muted rounded-full px-2 py-0.5 shrink-0 ml-2">
          {cards.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 rounded-xl transition-colors min-h-[80px] flex flex-col',
          isOver ? 'bg-accent/60 ring-2 ring-primary/30' : 'bg-muted/40'
        )}
      >
        <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2 p-2 flex-1">
            {cards.map((card) => (
              <KanbanCard key={card.id} card={card} fields={fields} />
            ))}
          </div>
        </SortableContext>

        <div className="p-2 pt-0">
          <NewCardButton phaseId={phase.id} pipeId={pipeId} />
        </div>
      </div>
    </div>
  )
}
