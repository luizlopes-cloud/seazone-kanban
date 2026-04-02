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

const CITY_COLORS: Record<string, string> = {
  'Florianópolis': 'bg-blue-100 text-blue-700',
  'São Paulo':     'bg-purple-100 text-purple-700',
  'Salvador':      'bg-orange-100 text-orange-700',
  'Rio de Janeiro':'bg-green-100 text-green-700',
  'Curitiba':      'bg-cyan-100 text-cyan-700',
  'Itapema':       'bg-teal-100 text-teal-700',
  'Balneário':     'bg-sky-100 text-sky-700',
  'Bombinhas':     'bg-indigo-100 text-indigo-700',
}
function cityColor(cidade: string) {
  for (const [k, v] of Object.entries(CITY_COLORS)) {
    if (cidade.includes(k)) return v
  }
  return 'bg-slate-100 text-slate-600'
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 60) return `${min}min atrás`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}h atrás`
  return `${Math.floor(h / 24)}d atrás`
}

export function KanbanCard({ card, fields, isDragging }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortableDragging } = useSortable({
    id: card.id,
  })

  const style = { transform: CSS.Transform.toString(transform), transition }

  const f = (...keys: string[]) => { for (const k of keys) { const v = card.fields[k]; if (v) return String(v) } return undefined }

  const codigo    = f('im_vel', 'c_digo_do_im_vel', 'codigo_imovel')
  const anfitriao = f('anfitri_o_respons_vel', 'datas_dispon_veis', 'nome_proprietario')
  const cidade    = f('cidade', 'location')
  const etiqueta  = f('etiqueta')
  const validade  = f('validade')

  const isValidadeOverdue = validade && new Date(validade) < new Date()
  const cidadeColor = cidade ? cityColor(cidade) : null

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'group relative bg-card rounded-xl border border-border cursor-grab active:cursor-grabbing select-none',
        'shadow-sm hover:shadow-[0_8px_24px_-8px_rgba(20,29,46,0.15)] transition-all duration-150',
        (isDragging || isSortableDragging) && 'opacity-40 shadow-lg rotate-1',
      )}
    >
      {/* Standby left bar */}
      {card.is_standby && (
        <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full bg-amber-400" />
      )}

      <div className="p-3.5 pl-4">
        {/* Top row: code + city tag */}
        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
          {codigo && (
            <span className="text-[11px] font-mono font-semibold bg-muted text-muted-foreground rounded-md px-1.5 py-0.5">
              {codigo}
            </span>
          )}
          {cidade && cidadeColor && (
            <span className={cn('text-[11px] font-medium rounded-md px-1.5 py-0.5', cidadeColor)}>
              {cidade.split(',')[0]}
            </span>
          )}
          {etiqueta && (
            <span className="text-[11px] font-medium bg-violet-100 text-violet-700 rounded-md px-1.5 py-0.5">
              {etiqueta}
            </span>
          )}
          {card.is_standby && (
            <span className="text-[11px] font-medium bg-amber-50 text-amber-600 rounded-md px-1.5 py-0.5 ml-auto">
              ⏸ Stand-by
            </span>
          )}
        </div>

        {/* Title */}
        <p className="text-[14px] font-semibold text-foreground leading-snug line-clamp-2 mb-2">
          {card.title}
        </p>

        {/* Anfitrião */}
        {anfitriao && (
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
              {anfitriao.charAt(0).toUpperCase()}
            </div>
            <span className="text-[12px] text-muted-foreground truncate">{anfitriao}</span>
          </div>
        )}

        {/* Footer: validade + updated_at */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/60 gap-2">
          <div className="flex items-center gap-1 min-w-0">
            {validade ? (
              <span className={cn(
                'text-[11px] font-medium flex items-center gap-1',
                isValidadeOverdue ? 'text-destructive' : 'text-muted-foreground'
              )}>
                {isValidadeOverdue ? '⚠' : '📋'} Val. {new Date(validade).toLocaleDateString('pt-BR')}
              </span>
            ) : (
              <span className="text-[11px] text-border">Sem validade</span>
            )}
          </div>
          <span className="text-[10px] text-muted-foreground/60 shrink-0">
            {relativeTime(card.updated_at)}
          </span>
        </div>
      </div>

      <Link
        href={`/card/${card.id}`}
        className="absolute inset-0 rounded-xl"
        draggable={false}
        tabIndex={-1}
        aria-label={`Abrir card ${card.title}`}
      />
    </div>
  )
}
