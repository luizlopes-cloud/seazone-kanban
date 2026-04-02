'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Card, PipeField } from '@/types/domain'

interface Props {
  card: Card
  fields: PipeField[]
  isDragging?: boolean
}

export function KanbanCard({ card, fields, isDragging }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortableDragging } = useSortable({
    id: card.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const codigoField = fields.find((f) => f.key === 'codigo_imovel')
  const codigo = codigoField ? (card.fields[codigoField.key] as string) : null

  const isOverdue = card.due_date && new Date(card.due_date) < new Date()

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'group relative bg-card rounded-xl border border-border cursor-grab active:cursor-grabbing select-none',
        'shadow-sm hover:shadow-md transition-all duration-150',
        (isDragging || isSortableDragging) && 'opacity-40 shadow-lg rotate-1',
      )}
    >
      {/* Left accent bar for standby */}
      {card.is_standby && (
        <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-amber-400" />
      )}

      <div className="p-3">
        {/* Title */}
        <p className="text-[13px] font-medium text-foreground leading-snug line-clamp-2">
          {card.title}
        </p>

        {/* Code tag */}
        {codigo && (
          <span className="inline-block mt-1.5 text-[11px] font-mono bg-muted text-muted-foreground rounded px-1.5 py-0.5">
            {codigo}
          </span>
        )}

        {/* Footer row */}
        {(card.due_date || card.is_standby) && (
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/60">
            {card.due_date && (
              <span className={cn(
                'text-[11px] flex items-center gap-1',
                isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'
              )}>
                {isOverdue ? '⚠' : '📅'} {new Date(card.due_date).toLocaleDateString('pt-BR')}
              </span>
            )}
            {card.is_standby && (
              <span className="text-[11px] text-amber-600 font-medium ml-auto">Stand-by</span>
            )}
          </div>
        )}
      </div>

      {/* Invisible link overlay */}
      <Link
        href={`/card/${card.id}`}
        className="absolute inset-0 rounded-xl"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        draggable={false}
        tabIndex={-1}
        aria-label={`Abrir card ${card.title}`}
      />
    </div>
  )
}
