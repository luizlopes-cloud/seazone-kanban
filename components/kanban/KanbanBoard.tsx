'use client'

import { useState, useEffect, useTransition, useRef } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable'
import { KanbanColumn } from './KanbanColumn'
import { KanbanCard } from './KanbanCard'
import { StandbyModal } from '@/components/layout/StandbyModal'
import { moveCard } from '@/lib/actions/phases'
import type { BoardData, Card, Phase } from '@/types/domain'

interface Props {
  data: BoardData
}

type ColumnMap = Record<string, Card[]>

function buildColumns(cards: Card[], phases: Phase[]): ColumnMap {
  const map: ColumnMap = {}
  for (const p of phases) map[p.id] = []
  for (const c of cards) {
    if (c.phase_id && map[c.phase_id]) map[c.phase_id].push(c)
  }
  return map
}

// Finds a card or column location within a given map (used inside setColumns updater)
function findInMap(map: ColumnMap, phases: Phase[], id: string): { phaseId: string; index: number } | null {
  if (phases.find((p) => p.id === id)) return { phaseId: id, index: -1 }
  for (const [phaseId, cards] of Object.entries(map)) {
    const index = cards.findIndex((c) => c.id === id)
    if (index !== -1) return { phaseId, index }
  }
  return null
}

export function KanbanBoard({ data }: Props) {
  const { phases, fields } = data

  const [columns, setColumns] = useState<ColumnMap>(() => buildColumns(data.cards, phases))
  // Ref always has latest columns — used in onDragEnd to read final state
  const columnsRef = useRef(columns)
  columnsRef.current = columns

  const draggingRef = useRef(false)

  useEffect(() => {
    if (!draggingRef.current) setColumns(buildColumns(data.cards, phases))
  }, [data.cards]) // eslint-disable-line react-hooks/exhaustive-deps

  const [activeCard, setActiveCard] = useState<Card | null>(null)
  const [standbyTarget, setStandbyTarget] = useState<{ card: Card; phase: Phase } | null>(null)
  const [, startTransition] = useTransition()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragStart(event: DragStartEvent) {
    draggingRef.current = true
    const card = Object.values(columnsRef.current).flat().find((c) => c.id === event.active.id)
    if (card) setActiveCard(card)
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const activeId = active.id as string
    const overId = over.id as string

    // All lookups happen inside the updater so they always use the latest state
    setColumns((prev) => {
      const activeLoc = findInMap(prev, phases, activeId)
      const overLoc = findInMap(prev, phases, overId)
      if (!activeLoc || !overLoc) return prev

      const { phaseId: fromPhaseId, index: fromIndex } = activeLoc
      const { phaseId: toPhaseId, index: overIndex } = overLoc

      if (fromPhaseId === toPhaseId) {
        // Same column: reorder
        if (fromIndex === -1 || overIndex === -1 || fromIndex === overIndex) return prev
        return { ...prev, [fromPhaseId]: arrayMove(prev[fromPhaseId], fromIndex, overIndex) }
      }

      // Cross-column: remove from source, insert at target index
      const card = prev[fromPhaseId][fromIndex]
      if (!card) return prev

      const movedCard = { ...card, phase_id: toPhaseId }
      const newFrom = prev[fromPhaseId].filter((c) => c.id !== activeId)
      const insertAt = overIndex === -1 ? prev[toPhaseId].length : overIndex
      const newTo = [
        ...prev[toPhaseId].slice(0, insertAt),
        movedCard,
        ...prev[toPhaseId].slice(insertAt),
      ]

      return { ...prev, [fromPhaseId]: newFrom, [toPhaseId]: newTo }
    })
  }

  function handleDragEnd(event: DragEndEvent) {
    draggingRef.current = false
    const originalCard = activeCard
    setActiveCard(null)

    const { active } = event
    if (!originalCard) return

    // Read final position from ref (latest state after all onDragOver updates)
    const finalLoc = findInMap(columnsRef.current, phases, active.id as string)
    if (!finalLoc) {
      setColumns(buildColumns(data.cards, phases))
      return
    }

    const toPhaseId = finalLoc.phaseId
    if (originalCard.phase_id === toPhaseId) return // same column, no server call

    const toPhase = phases.find((p) => p.id === toPhaseId)
    if (!toPhase) return

    if (toPhase.is_standby) {
      setColumns(buildColumns(data.cards, phases))
      setStandbyTarget({ card: originalCard, phase: toPhase })
      return
    }

    startTransition(async () => {
      await moveCard(originalCard.id, toPhaseId)
    })
  }

  function handleDragCancel() {
    draggingRef.current = false
    setActiveCard(null)
    setColumns(buildColumns(data.cards, phases))
  }

  function handleStandbyConfirm() {
    if (!standbyTarget) return
    const { card, phase } = standbyTarget
    setStandbyTarget(null)
    setColumns((prev) => {
      const fromPhaseId = card.phase_id ?? ''
      const newFrom = (prev[fromPhaseId] ?? []).filter((c) => c.id !== card.id)
      const newTo = [...(prev[phase.id] ?? []), { ...card, phase_id: phase.id }]
      return { ...prev, [fromPhaseId]: newFrom, [phase.id]: newTo }
    })
    startTransition(async () => {
      await moveCard(card.id, phase.id)
    })
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="flex-1 flex gap-3 overflow-x-auto px-6 py-4 min-w-0">
          {phases.map((phase) => (
            <KanbanColumn
              key={phase.id}
              phase={phase}
              cards={columns[phase.id] ?? []}
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
          onCancel={() => { setColumns(buildColumns(data.cards, phases)); setStandbyTarget(null) }}
        />
      )}
    </>
  )
}
