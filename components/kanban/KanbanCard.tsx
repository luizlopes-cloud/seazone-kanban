'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'group relative bg-card border rounded-lg p-3 cursor-grab active:cursor-grabbing transition-shadow select-none',
        (isDragging || isSortableDragging) && 'opacity-50 shadow-lg',
        'hover:shadow-md hover:border-border'
      )}
    >
      {/* Standby badge */}
      {card.is_standby && (
        <Badge variant="outline" className="absolute top-2 right-2 text-xs text-yellow-500 border-yellow-500/40 py-0">
          Stand-by
        </Badge>
      )}

      {/* Title */}
      <p className="text-sm font-medium text-foreground leading-snug pr-2 line-clamp-2">
        {card.title}
      </p>

      {/* Code */}
      {codigo && (
        <p className="text-xs text-muted-foreground mt-1">{codigo}</p>
      )}

      {/* Due date */}
      {card.due_date && (
        <p className={cn(
          'text-xs mt-1.5',
          new Date(card.due_date) < new Date() ? 'text-destructive' : 'text-muted-foreground'
        )}>
          {new Date(card.due_date).toLocaleDateString('pt-BR')}
        </p>
      )}

      {/* Link to detail (click, not drag) */}
      <Link
        href={`/card/${card.id}`}
        className="absolute inset-0 rounded-lg"
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
