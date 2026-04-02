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

function FieldList({
  fields,
  fieldValues,
  onChange,
  disabled,
  readOnly = false,
}: {
  fields: PipeField[]
  fieldValues: Record<string, unknown>
  onChange?: (key: string, value: unknown) => void
  disabled?: boolean
  readOnly?: boolean
}) {
  const visible = fields.filter((f) =>
    f.type !== 'statement' &&
    (readOnly ? fieldValues[f.key] !== undefined && fieldValues[f.key] !== null && fieldValues[f.key] !== '' : true)
  )
  if (visible.length === 0) return <p className="text-xs text-muted-foreground px-4 py-3 italic">Sem campos preenchidos</p>

  return (
    <div className="divide-y divide-border">
      {visible.map((field) => (
        <div key={field.id} className="flex items-start gap-3 px-4 py-2.5">
          <label className="text-[12px] font-medium text-muted-foreground w-36 shrink-0 pt-1.5 leading-snug">
            {field.label}
            {field.required && !readOnly && <span className="text-destructive ml-1">*</span>}
          </label>
          <div className="flex-1 min-w-0">
            {readOnly ? (
              <p className="text-[13px] text-foreground pt-1.5 break-words">
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
  )
}

export function CardDetail({ card, fields, phases, conditionals, activities, connectedCards = [] }: Props) {
  const router = useRouter()
  const [fieldValues, setFieldValues] = useState<Record<string, unknown>>(card.fields ?? {})
  const [isPending, startTransition] = useTransition()
  const [historyOpen, setHistoryOpen] = useState(false)

  const visibleFieldIds = evaluateConditionals(conditionals, fieldValues, fields.map((f) => f.id))
  const currentPhase = phases.find((p) => p.id === card.phase_id)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleFieldChange = useCallback((fieldKey: string, value: unknown) => {
    setFieldValues((prev) => ({ ...prev, [fieldKey]: value }))
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      startTransition(async () => { await updateCardField(card.id, fieldKey, value) })
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
    startTransition(async () => { await deleteCard(card.id); router.back() })
  }

  // Organize fields
  const visibleFields = fields.filter((f) => visibleFieldIds.has(f.id))
  const startFormFields = visibleFields.filter((f) => f.phase_id === null)
  const currentPhaseFields = visibleFields.filter((f) => f.phase_id === card.phase_id)

  // Previous phases (by position, skip standby)
  const sortedPhases = [...phases].sort((a, b) => a.position - b.position)
  const currentPhasePos = currentPhase?.position ?? 0
  const prevPhasesWithFields = sortedPhases
    .filter((p) => p.position < currentPhasePos && !p.is_standby)
    .map((phase) => ({ phase, fields: visibleFields.filter((f) => f.phase_id === phase.id) }))
    .filter(({ fields: pf }) => pf.some((f) => fieldValues[f.key] !== undefined && fieldValues[f.key] !== null && fieldValues[f.key] !== ''))

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-3.5 border-b shrink-0 bg-card">
        <button onClick={() => router.back()} className="text-muted-foreground hover:text-foreground text-sm shrink-0">
          ← Voltar
        </button>
        <span className="text-muted-foreground text-sm">|</span>
        <h1 className="text-base font-semibold truncate flex-1">{card.title}</h1>
        {card.is_standby && (
          <Badge variant="outline" className="text-amber-600 border-amber-400/40 shrink-0">⏸ Stand-by</Badge>
        )}
        <Button variant="ghost" size="sm" onClick={handleDelete} className="text-destructive shrink-0">Excluir</Button>
      </div>

      {/* Body: left history panel + center content */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left: fases anteriores */}
        {prevPhasesWithFields.length > 0 && (
          <div className={cn(
            'flex-shrink-0 border-r border-border bg-card transition-all duration-200 overflow-hidden flex flex-col',
            historyOpen ? 'w-72' : 'w-10'
          )}>
            {/* Toggle button */}
            <button
              onClick={() => setHistoryOpen((o) => !o)}
              className="flex items-center gap-2 px-3 py-3 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors border-b border-border w-full shrink-0"
            >
              <span className="shrink-0">{historyOpen ? '◀' : '▶'}</span>
              {historyOpen && <span className="truncate">Fases anteriores</span>}
            </button>

            {/* Phase history content */}
            {historyOpen && (
              <div className="flex-1 overflow-y-auto">
                {prevPhasesWithFields.map(({ phase, fields: pf }, idx) => (
                  <PhaseHistorySection key={phase.id} phase={phase} fields={pf} fieldValues={fieldValues} defaultOpen={idx === prevPhasesWithFields.length - 1} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Center: current fields */}
        <div className="flex-1 overflow-y-auto bg-background">
          <div className="max-w-2xl mx-auto px-6 py-5 space-y-4">

            {/* Phase selector */}
            <div className="rounded-lg border border-border bg-card flex items-center gap-4 px-4 py-3">
              <span className="text-[13px] font-medium text-muted-foreground w-36 shrink-0">Fase atual</span>
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

            {/* Stand-by banner */}
            {card.is_standby && (
              <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-amber-700">Card em Stand-By</p>
                  {card.standby_due_date && (
                    <p className="text-xs text-amber-600 mt-0.5">
                      Retorno previsto: {new Date(card.standby_due_date).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>
                <Button size="sm" variant="outline" onClick={handleDeactivateStandby} disabled={isPending}>
                  Sair do Stand-By
                </Button>
              </div>
            )}

            {/* Current phase fields */}
            {currentPhaseFields.length > 0 && (
              <div className="rounded-lg border border-border bg-card overflow-hidden">
                <div className="px-4 py-2.5 border-b border-border bg-muted/30">
                  <h3 className="text-[13px] font-semibold">{currentPhase?.name ?? 'Fase atual'}</h3>
                </div>
                <FieldList fields={currentPhaseFields} fieldValues={fieldValues} onChange={handleFieldChange} disabled={isPending} />
              </div>
            )}

            {/* Start form fields */}
            {startFormFields.length > 0 && (
              <div className="rounded-lg border border-border bg-card overflow-hidden">
                <div className="px-4 py-2.5 border-b border-border bg-muted/30">
                  <h3 className="text-[13px] font-semibold">Informações do imóvel</h3>
                </div>
                <FieldList fields={startFormFields} fieldValues={fieldValues} onChange={handleFieldChange} disabled={isPending} />
              </div>
            )}

            {/* Connected cards */}
            {connectedCards.length > 0 && (
              <div className="rounded-lg border border-border bg-card overflow-hidden">
                <div className="px-4 py-2.5 border-b border-border bg-muted/30">
                  <h3 className="text-[13px] font-semibold">Cards conectados</h3>
                </div>
                <div className="divide-y divide-border">
                  {connectedCards.map((cc) => (
                    <a key={cc.id} href={`/card/${cc.id}`}
                      className="flex items-center justify-between px-4 py-2.5 hover:bg-muted/30 transition-colors">
                      <span className="text-sm font-medium">{cc.title}</span>
                      <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full shrink-0 ml-2">
                        {cc.pipe?.name?.replace(/^PIPE \d+ - /, '') ?? 'Funil'}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Activity */}
            {activities.length > 0 && (
              <div className="rounded-lg border border-border bg-card overflow-hidden">
                <div className="px-4 py-2.5 border-b border-border bg-muted/30">
                  <h3 className="text-[13px] font-semibold">Histórico</h3>
                </div>
                <div className="divide-y divide-border px-4">
                  {activities.map((a) => <ActivityItem key={a.id} activity={a} />)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function PhaseHistorySection({ phase, fields, fieldValues, defaultOpen }: {
  phase: Phase
  fields: PipeField[]
  fieldValues: Record<string, unknown>
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen ?? false)
  return (
    <div className="border-b border-border">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-muted/40 transition-colors"
      >
        <span className="text-[12px] font-semibold text-foreground leading-snug">{phase.name}</span>
        <span className="text-muted-foreground text-[10px] ml-2 shrink-0">{open ? '▲' : '▼'}</span>
      </button>
      {open && <FieldList fields={fields} fieldValues={fieldValues} readOnly />}
    </div>
  )
}

const ACTIVITY_LABELS: Record<string, string> = {
  card_created: 'Card criado', phase_move: 'Movido de fase', field_update: 'Campo atualizado',
  standby_on: 'Entrou em Stand-By', standby_off: 'Saiu do Stand-By',
  automation_fired: 'Automação executada', comment: 'Comentário',
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
      </span>
    </div>
  )
}
