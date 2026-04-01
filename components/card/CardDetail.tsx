'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { FieldRenderer } from './FieldRenderer'
import { evaluateConditionals } from '@/lib/automation/conditionals'
import { updateCardField, deleteCard } from '@/lib/actions/cards'
import { moveCard } from '@/lib/actions/phases'
import { deactivateStandby } from '@/lib/actions/standby'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Card, PipeField, Phase, FieldConditional, CardActivity } from '@/types/domain'
import { cn } from '@/lib/utils'

interface Props {
  card: Card
  fields: PipeField[]
  phases: Phase[]
  conditionals: FieldConditional[]
  activities: CardActivity[]
}

export function CardDetail({ card, fields, phases, conditionals, activities }: Props) {
  const router = useRouter()
  const [fieldValues, setFieldValues] = useState<Record<string, unknown>>(card.fields ?? {})
  const [isPending, startTransition] = useTransition()

  // Evaluate which fields are visible
  const visibleFieldIds = evaluateConditionals(conditionals, fieldValues, fields.map((f) => f.id))

  const currentPhase = phases.find((p) => p.id === card.phase_id)

  function handleFieldChange(fieldKey: string, value: unknown) {
    setFieldValues((prev) => ({ ...prev, [fieldKey]: value }))
    startTransition(async () => {
      await updateCardField(card.id, fieldKey, value)
    })
  }

  function handlePhaseChange(newPhaseId: string | null) {
    if (!newPhaseId) return
    startTransition(async () => {
      await moveCard(card.id, newPhaseId)
    })
  }

  function handleDeactivateStandby() {
    const nextPhase = phases.find((p) => !p.is_standby && !p.is_done)
    if (!nextPhase) return
    startTransition(async () => {
      await deactivateStandby(card.id, nextPhase.id)
    })
  }

  function handleDelete() {
    if (!confirm('Excluir este card?')) return
    startTransition(async () => {
      await deleteCard(card.id)
      router.back()
    })
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b shrink-0">
        <button
          onClick={() => router.back()}
          className="text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          ← Voltar
        </button>
        <Separator orientation="vertical" className="h-4" />
        <h1 className="text-lg font-semibold truncate flex-1">{card.title}</h1>
        {card.is_standby && (
          <Badge variant="outline" className="text-yellow-500 border-yellow-500/40 shrink-0">
            Stand-by
          </Badge>
        )}
        <Button variant="ghost" size="sm" onClick={handleDelete} className="text-destructive shrink-0">
          Excluir
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-6 space-y-6">
          {/* Phase selector */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground w-24 shrink-0">Fase atual</span>
            <Select value={card.phase_id ?? ''} onValueChange={handlePhaseChange} disabled={isPending}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {phases.map((phase) => (
                  <SelectItem key={phase.id} value={phase.id}>
                    {phase.is_standby && '⏸ '}
                    {phase.is_done && '✓ '}
                    {phase.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Stand-by controls */}
          {card.is_standby && (
            <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4 space-y-2">
              <p className="text-sm font-medium text-yellow-600">Card em Stand-By</p>
              {card.standby_due_date && (
                <p className="text-xs text-muted-foreground">
                  Previsão de retorno: {new Date(card.standby_due_date).toLocaleDateString('pt-BR')}
                </p>
              )}
              <Button size="sm" variant="outline" onClick={handleDeactivateStandby} disabled={isPending}>
                Sair do Stand-By
              </Button>
            </div>
          )}

          <Separator />

          {/* Fields */}
          <div className="space-y-4">
            {fields
              .filter((f) => visibleFieldIds.has(f.id) && f.type !== 'statement')
              .map((field) => (
                <div key={field.id} className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-muted-foreground">
                    {field.label}
                    {field.required && <span className="text-destructive ml-1">*</span>}
                  </label>
                  <FieldRenderer
                    field={field}
                    value={fieldValues[field.key]}
                    onChange={(v) => handleFieldChange(field.key, v)}
                    disabled={!field.editable || isPending}
                  />
                </div>
              ))}
          </div>

          <Separator />

          {/* Activity log */}
          {activities.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Histórico</h3>
              <div className="space-y-2">
                {activities.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ActivityItem({ activity }: { activity: CardActivity }) {
  const labels: Record<string, string> = {
    card_created: 'Card criado',
    phase_move: 'Movido de fase',
    field_update: 'Campo atualizado',
    standby_on: 'Entrou em Stand-By',
    standby_off: 'Saiu do Stand-By',
    automation_fired: 'Automação executada',
    comment: 'Comentário',
  }

  const p = activity.payload as Record<string, unknown>

  return (
    <div className="flex gap-2 text-xs text-muted-foreground">
      <span className="shrink-0">{new Date(activity.created_at).toLocaleString('pt-BR')}</span>
      <span>·</span>
      <span>
        {labels[activity.type] ?? activity.type}
        {activity.type === 'phase_move' && typeof p.to_phase_name === 'string' ? ` → ${p.to_phase_name}` : null}
        {activity.type === 'automation_fired' && typeof p.rule_name === 'string' ? `: ${p.rule_name}` : null}
      </span>
    </div>
  )
}
