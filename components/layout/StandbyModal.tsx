'use client'

import { useState, useTransition } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { activateStandby } from '@/lib/actions/standby'
import { STANDBY_REASONS } from '@/types/domain'
import type { Card, Phase, StandbyReason } from '@/types/domain'

interface Props {
  card: Card
  phase: Phase
  onConfirm: () => void
  onCancel: () => void
}

export function StandbyModal({ card, phase, onConfirm, onCancel }: Props) {
  const [reason, setReason] = useState<StandbyReason | ''>('')
  const [dueDate, setDueDate] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleConfirm() {
    if (!reason) return
    startTransition(async () => {
      await activateStandby(
        card.id,
        reason as StandbyReason,
        dueDate || null,
        card.phase_id ?? phase.id
      )
      onConfirm()
    })
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Entrar em Stand-By</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            Card: <strong className="text-foreground">{card.title}</strong>
          </p>
          <p className="text-sm text-muted-foreground">
            Fase destino: <strong className="text-foreground">{phase.name}</strong>
          </p>

          <div className="space-y-2">
            <Label htmlFor="standby-reason">Motivo *</Label>
            <Select value={reason} onValueChange={(v) => setReason(v as StandbyReason)}>
              <SelectTrigger id="standby-reason">
                <SelectValue placeholder="Selecione o motivo..." />
              </SelectTrigger>
              <SelectContent>
                {STANDBY_REASONS.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="standby-date">Previsão de retorno</Label>
            <Input
              id="standby-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onCancel} disabled={isPending}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!reason || isPending}>
            {isPending ? 'Salvando...' : 'Confirmar Stand-By'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
