'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'

interface Props {
  connectorPipeId: string
  value: unknown
  onChange: (value: unknown) => void
  disabled?: boolean
}

interface CardOption {
  id: string
  title: string
}

export function ConnectorField({ connectorPipeId, value, onChange, disabled }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [options, setOptions] = useState<CardOption[]>([])
  const [loading, setLoading] = useState(false)
  const [displayTitle, setDisplayTitle] = useState<string>('')
  const containerRef = useRef<HTMLDivElement>(null)

  const strValue = value === null || value === undefined ? '' : String(value)

  // Resolve display title for current value
  useEffect(() => {
    if (!strValue) { setDisplayTitle(''); return }
    const supabase = createClient()
    supabase.from('cards').select('title').eq('id', strValue).single()
      .then(({ data }) => setDisplayTitle(data?.title ?? strValue))
  }, [strValue])

  // Search cards in the connected pipe
  useEffect(() => {
    if (!open) return
    setLoading(true)
    const supabase = createClient()
    const q = supabase.from('cards').select('id, title').eq('pipe_id', connectorPipeId).order('title')
    if (query) q.ilike('title', `%${query}%`)
    q.limit(20).then(({ data }) => {
      setOptions(data ?? [])
      setLoading(false)
    })
  }, [open, query, connectorPipeId])

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  function handleSelect(card: CardOption) {
    onChange(card.id)
    setDisplayTitle(card.title)
    setOpen(false)
    setQuery('')
  }

  function handleClear() {
    onChange('')
    setDisplayTitle('')
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="flex gap-1">
        <div
          className="flex-1 flex items-center gap-2 h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm cursor-pointer hover:bg-accent/30 transition-colors"
          onClick={() => !disabled && setOpen(true)}
        >
          {strValue
            ? <span className="truncate">{displayTitle || strValue}</span>
            : <span className="text-muted-foreground">Selecionar card...</span>
          }
        </div>
        {strValue && !disabled && (
          <button
            onClick={handleClear}
            className="px-2 text-muted-foreground hover:text-foreground text-xs rounded border border-input hover:bg-accent/30"
            type="button"
          >
            ✕
          </button>
        )}
      </div>

      {open && (
        <div className="absolute z-50 w-full mt-1 rounded-md border border-border bg-popover shadow-md">
          <div className="p-2 border-b border-border">
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar card..."
              className="h-7 text-sm"
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {loading && (
              <div className="px-3 py-2 text-xs text-muted-foreground">Carregando...</div>
            )}
            {!loading && options.length === 0 && (
              <div className="px-3 py-2 text-xs text-muted-foreground">Nenhum card encontrado</div>
            )}
            {options.map((card) => (
              <div
                key={card.id}
                className={`px-3 py-2 text-sm cursor-pointer hover:bg-accent/50 ${card.id === strValue ? 'bg-accent/30 font-medium' : ''}`}
                onClick={() => handleSelect(card)}
              >
                {card.title}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
