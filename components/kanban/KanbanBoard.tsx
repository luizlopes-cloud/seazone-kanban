'use client'

import { useState, useOptimistic, useTransition } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { KanbanColumn } from './KanbanColumn'
import { KanbanCard } from './KanbanCard'
import { StandbyModal } from '@/components/layout/StandbyModal'
import { moveCard } from '@/lib/actions/phases'
import type { BoardData, Card, Phase } from '@/types/domain'

interface Props {
  data: BoardData
}

export function KanbanBoard({ data }: Props) {
  const { phases, fields } = data
  const [activeCard, setActiveCard] = useState<Card | null>(null)
  const [standbyTarget, setStandbyTarget] = useState<{ card: Card; phase: Phase } | null>(null)
  const [isPending, startTransition] = useTransition()

  // Optimistic cards state
  const [optimisticCards, updateOptimisticCards] = useOptimistic(
    data.cards,
    (current: Card[], { cardId, toPhaseId }: { cardId: string; toPhaseId: string }) =>
      current.map((c) => (c.id === cardId ? { ...c, phase_id: toPhaseId } : c))
  )

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragStart(event: DragStartEvent) {
    const card = optimisticCards.find((c) => c.id === event.active.id)
    if (card) setActiveCard(card)
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveCard(null)
    const { active, over } = event
    if (!over) return

    const cardId = active.id as string
    const toPhaseId = over.id as string

    const card = optimisticCards.find((c) => c.id === cardId)
    if (!card || card.phase_id === toPhaseId) return

    const toPhase = phases.find((p) => p.id === toPhaseId)
    if (!toPhase) return

    // If moving to standby phase, show modal first
    if (toPhase.is_standby) {
      setStandbyTarget({ card, phase: toPhase })
      return
    }

    startTransition(async () => {
      updateOptimisticCards({ cardId, toPhaseId })
      await moveCard(cardId, toPhaseId)
    })
  }

  function handleStandbyConfirm() {
    if (!standbyTarget) return
    const { card, phase } = standbyTarget
    setStandbyTarget(null)
    startTransition(async () => {
      updateOptimisticCards({ cardId: card.id, toPhaseId: phase.id })
      await moveCard(card.id, phase.id)
    })
  }

  // Group cards by phase
  const cardsByPhase = phases.reduce<Record<string, Card[]>>((acc, phase) => {
    acc[phase.id] = optimisticCards.filter((c) => c.phase_id === phase.id)
    return acc
  }, {})

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 flex gap-3 overflow-x-auto px-6 py-4 min-w-0">
          {phases.map((phase) => (
            <KanbanColumn
              key={phase.id}
              phase={phase}
              cards={cardsByPhase[phase.id] ?? []}
              fields={fields}
              pipeId={data.pipe.id}
            />
          ))}
        </div>

        <DragOverlay>
          {activeCard && (
            <KanbanCard card={activeCard} fields={fields} isDragging />
          )}
        </DragOverlay>
      </DndContext>

      {standbyTarget && (
        <StandbyModal
          card={standbyTarget.card}
          phase={standbyTarget.phase}
          onConfirm={handleStandbyConfirm}
          onCancel={() => setStandbyTarget(null)}
        />
      )}
    </>
  )
}
