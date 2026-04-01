'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createCard } from '@/lib/actions/cards'

interface Props {
  phaseId: string
  pipeId: string
}

export function NewCardButton({ phaseId, pipeId }: Props) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    startTransition(async () => {
      await createCard({ title: title.trim(), phaseId, pipeId })
      setTitle('')
      setOpen(false)
    })
  }

  if (open) {
    return (
      <form onSubmit={handleSubmit} className="space-y-1.5">
        <Input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título do card..."
          className="text-sm h-8"
          onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
        />
        <div className="flex gap-1">
          <Button type="submit" size="sm" className="flex-1 h-7 text-xs" disabled={isPending}>
            {isPending ? '...' : 'Criar'}
          </Button>
          <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setOpen(false)}>
            ✕
          </Button>
        </div>
      </form>
    )
  }

  return (
    <button
      onClick={() => setOpen(true)}
      className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1 text-left px-1 rounded"
    >
      + Novo card
    </button>
  )
}
