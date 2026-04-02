'use client'

import { useState, useTransition, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FieldRenderer } from './FieldRenderer'
import { evaluateConditionals } from '@/lib/automation/conditionals'
import { updateCardField, deleteCard } from '@/lib/actions/cards'
import { moveCard } from '@/lib/actions/phases'
import { deactivateStandby } from '@/lib/actions/standby'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Card, PipeField, Phase, FieldConditional, CardActivity } from '@/types/domain'
import { cn } from '@/lib/utils'

interface ConnectedCard {
  id: string
  title: string
  pipe_id: string
  phase_id: string | null
  pipe?: { id: string; name: string; slug: string }
}

interface Props {
  card: Card
  fields: PipeField[]
  phases: Phase[]
  conditionals: FieldConditional[]
  activities: CardActivity[]
  connectedCards?: ConnectedCard[]
}

function FieldSection({
  title,
  fields,
  fieldValues,
  onChange,
  disabled,
  readOnly = false,
  defaultOpen = true,
}: {
  title: string
  fields: PipeField[]
  fieldValues: Record<string, unknown>
  onChange?: (key: string, value: unknown) => void
  disabled?: boolean
  readOnly?: boolean
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  const visibleFields = fields.filter(
    (f) => f.type !== 'statement' && (readOnly ? fieldValues[f.key] !== undefined && fieldValues[f.key] !== '' && fieldValues[f.key] !== null : true)
  )
  if (visibleFields.length === 0) return null

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-muted/30 hover:bg-muted/50 transition-colors border-b border-border"
      >
        <span className="text-[13px] font-semibold text-foreground">{title}</span>
        <span className="text-muted-foreground text-xs">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="divide-y divide-border">
          {visibleFields.map((field) => (
            <div key={field.id} className="flex items-start gap-4 px-4 py-3">
              <label className="text-[13px] font-medium text-muted-foreground w-44 shrink-0 pt-1.5 leading-snug">
                {field.label}
                {field.required && !readOnly && <span className="text-destructive ml-1">*</span>}
              </label>
              <div className="flex-1 min-w-0">
                {readOnly ? (
                  <p className="text-sm text-foreground pt-1.5">
                    {String(fieldValues[field.key] ?? '—')}
                  </p>
                ) : (
                  <FieldRenderer
                    field={field}
                    value={fieldValues[field.key]}
                    onChange={(v) => onChange?.(field.key, v)}
                    disabled={!field.editable || disabled}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function CardDetail({ card, fields, phases, conditionals, activities, connectedCards = [] }: Props) {
  const router = useRouter()
  const [fieldValues, setFieldValues] = useState<Record<string, unknown>>(card.fields ?? {})
  const [isPending, startTransition] = useTransition()

  const visibleFieldIds = evaluateConditionals(conditionals, fieldValues, fields.map((f) => f.id))
  const currentPhase = phases.find((p) => p.id === card.phase_id)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleFieldChange = useCallback((fieldKey: string, value: unknown) => {
    setFieldValues((prev) => ({ ...prev, [fieldKey]: value }))
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      startTransition(async () => {
        await updateCardField(card.id, fieldKey, value)
      })
    }, 600)
  }, [card.id])

  function handlePhaseChange(newPhaseId: string | null) {
    if (!newPhaseId) return
    startTransition(async () => { await moveCard(card.id, newPhaseId) })
  }

  function handleDeactivateStandby() {
    const nextPhase = phases.find((p) => !p.is_standby && !p.is_done)
    if (!nextPhase) return
    startTransition(async () => { await deactivateStandby(card.id, nextPhase.id) })
  }

  function handleDelete() {
    if (!confirm('Excluir este card?')) return
    startTransition(async () => {
      await deleteCard(card.id)
      router.back()
    })
  }

  // Organize fields
  const visibleFields = fields.filter((f) => visibleFieldIds.has(f.id))
  const startFormFields = visibleFields.filter((f) => f.phase_id === null)
  const currentPhaseFields = visibleFields.filter((f) => f.phase_id === card.phase_id)

  // Previous phases: phases with position < current, that have fields with values
  const sortedPhases = [...phases].sort((a, b) => a.position - b.position)
  const currentPhasePos = currentPhase?.position ?? 0
  const previousPhases = sortedPhases.filter(
    (p) => p.position < currentPhasePos && !p.is_standby
  )
  const previousPhaseFields = previousPhases
    .map((phase) => ({
      phase,
      fields: visibleFields.filter((f) => f.phase_id === phase.id),
    }))
    .filter(({ fields: pf }) => pf.some((f) => fieldValues[f.key] !== undefined && fieldValues[f.key] !== null && fieldValues[f.key] !== ''))

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b shrink-0 bg-card">
        <button
          onClick={() => router.back()}
          className="text-muted-foreground hover:text-foreground transition-colors text-sm shrink-0"
        >
          ← Voltar
        </button>
        <span className="text-muted-foreground">|</span>
        <h1 className="text-lg font-semibold truncate flex-1">{card.title}</h1>
        {card.is_standby && (
          <Badge variant="outline" className="text-amber-600 border-amber-400/40 shrink-0">
            Stand-by
          </Badge>
        )}
        <Button variant="ghost" size="sm" onClick={handleDelete} className="text-destructive shrink-0">
          Excluir
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto bg-background">
        <div className="max-w-3xl mx-auto px-6 py-6 space-y-4">

          {/* Phase selector */}
          <div className="rounded-lg border border-border bg-card flex items-center gap-4 px-4 py-3">
            <span className="text-[13px] font-medium text-muted-foreground w-44 shrink-0">Fase atual</span>
            <Select value={card.phase_id ?? ''} onValueChange={handlePhaseChange} disabled={isPending}>
              <SelectTrigger className="flex-1 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {phases.map((phase) => (
                  <SelectItem key={phase.id} value={phase.id}>
                    {phase.is_standby && '⏸ '}{phase.is_done && '✓ '}{phase.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Stand-by controls */}
          {card.is_standby && (
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 space-y-2">
              <p className="text-sm font-medium text-amber-700">Card em Stand-By</p>
              {card.standby_due_date && (
                <p className="text-xs text-amber-600">
                  Previsão de retorno: {new Date(card.standby_due_date).toLocaleDateString('pt-BR')}
                </p>
              )}
              <Button size="sm" variant="outline" onClick={handleDeactivateStandby} disabled={isPending}>
                Sair do Stand-By
              </Button>
            </div>
          )}

          {/* Start form fields */}
          <FieldSection
            title="Informações do imóvel"
            fields={startFormFields}
            fieldValues={fieldValues}
            onChange={handleFieldChange}
            disabled={isPending}
            defaultOpen
          />

          {/* Current phase fields */}
          {currentPhase && currentPhaseFields.length > 0 && (
            <FieldSection
              title={`Fase atual — ${currentPhase.name}`}
              fields={currentPhaseFields}
              fieldValues={fieldValues}
              onChange={handleFieldChange}
              disabled={isPending}
              defaultOpen
            />
          )}

          {/* Previous phase fields (read-only, collapsed by default) */}
          {previousPhaseFields.map(({ phase, fields: pf }) => (
            <FieldSection
              key={phase.id}
              title={phase.name}
              fields={pf}
              fieldValues={fieldValues}
              readOnly
              defaultOpen={false}
            />
          ))}

          {/* Connected cards */}
          {connectedCards.length > 0 && (
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="px-4 py-2.5 border-b border-border bg-muted/30">
                <h3 className="text-[13px] font-semibold text-foreground">Cards conectados</h3>
              </div>
              <div className="divide-y divide-border">
                {connectedCards.map((cc) => (
                  <a
                    key={cc.id}
                    href={`/card/${cc.id}`}
                    className="flex items-center justify-between px-4 py-2.5 hover:bg-muted/30 transition-colors"
                  >
                    <span className="text-sm font-medium text-foreground">{cc.title}</span>
                    <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full shrink-0 ml-2">
                      {cc.pipe?.name?.replace(/^PIPE \d+ - /, '') ?? 'Funil'}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Activity log */}
          {activities.length > 0 && (
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="px-4 py-2.5 border-b border-border bg-muted/30">
                <h3 className="text-[13px] font-semibold text-foreground">Histórico</h3>
              </div>
              <div className="divide-y divide-border px-4">
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

const ACTIVITY_LABELS: Record<string, string> = {
  card_created: 'Card criado', phase_move: 'Movido de fase',
  field_update: 'Campo atualizado', standby_on: 'Entrou em Stand-By',
  standby_off: 'Saiu do Stand-By', automation_fired: 'Automação executada', comment: 'Comentário',
}

function ActivityItem({ activity }: { activity: CardActivity }) {
  const p = activity.payload as Record<string, unknown>
  return (
    <div className="flex gap-2 text-xs text-muted-foreground py-2">
      <span className="shrink-0">{new Date(activity.created_at).toLocaleString('pt-BR')}</span>
      <span>·</span>
      <span>
        {ACTIVITY_LABELS[activity.type] ?? activity.type}
        {activity.type === 'phase_move' && typeof p.to_phase_name === 'string' ? ` → ${p.to_phase_name}` : null}
        {activity.type === 'automation_fired' && typeof p.rule_name === 'string' ? `: ${p.rule_name}` : null}
      </span>
    </div>
  )
}
