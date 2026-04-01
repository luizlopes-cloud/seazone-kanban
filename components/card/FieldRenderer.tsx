'use client'

import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import type { PipeField, FieldOption } from '@/types/domain'

interface Props {
  field: PipeField
  value: unknown
  onChange: (value: unknown) => void
  disabled?: boolean
}

function getOptions(field: PipeField): FieldOption[] {
  if (!field.options) return []
  if (Array.isArray(field.options)) {
    return field.options.map((o) =>
      typeof o === 'string' ? { label: o, value: o } : (o as FieldOption)
    )
  }
  return []
}

export function FieldRenderer({ field, value, onChange, disabled }: Props) {
  const strValue = value === null || value === undefined ? '' : String(value)

  switch (field.type) {
    case 'short_text':
    case 'number':
    case 'currency':
      return (
        <Input
          type={field.type === 'number' || field.type === 'currency' ? 'number' : 'text'}
          value={strValue}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="text-sm"
        />
      )

    case 'long_text':
      return (
        <Textarea
          value={strValue}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="text-sm min-h-[80px]"
        />
      )

    case 'date':
    case 'due_date':
      return (
        <Input
          type="date"
          value={strValue}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="text-sm"
        />
      )

    case 'datetime':
      return (
        <Input
          type="datetime-local"
          value={strValue.replace('Z', '').replace(/\.\d+$/, '')}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="text-sm"
        />
      )

    case 'select':
    case 'label_select': {
      const opts = getOptions(field)
      return (
        <Select value={strValue} onValueChange={onChange} disabled={disabled}>
          <SelectTrigger className="text-sm">
            <SelectValue placeholder="Selecione..." />
          </SelectTrigger>
          <SelectContent>
            {opts.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }

    case 'radio_vertical':
    case 'radio_horizontal': {
      const opts = getOptions(field)
      const isHorizontal = field.type === 'radio_horizontal'
      return (
        <div className={`flex gap-3 ${isHorizontal ? 'flex-row flex-wrap' : 'flex-col'}`}>
          {opts.map((o) => (
            <label key={o.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={field.id}
                value={o.value}
                checked={strValue === o.value}
                onChange={() => onChange(o.value)}
                disabled={disabled}
                className="accent-primary"
              />
              <span className="text-sm">{o.label}</span>
            </label>
          ))}
        </div>
      )
    }

    case 'checklist_vertical':
    case 'checklist_horizontal': {
      const opts = getOptions(field)
      const currentValues: string[] = Array.isArray(value) ? (value as string[]) : []
      const isHorizontal = field.type === 'checklist_horizontal'

      function handleCheck(optValue: string, checked: boolean) {
        const next = checked
          ? [...currentValues, optValue]
          : currentValues.filter((v) => v !== optValue)
        onChange(next)
      }

      return (
        <div className={`flex gap-3 ${isHorizontal ? 'flex-row flex-wrap' : 'flex-col'}`}>
          {opts.map((o) => (
            <label key={o.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                value={o.value}
                checked={currentValues.includes(o.value)}
                onChange={(e) => handleCheck(o.value, e.target.checked)}
                disabled={disabled}
                className="accent-primary"
              />
              <span className="text-sm">{o.label}</span>
            </label>
          ))}
        </div>
      )
    }

    case 'connector':
      return (
        <Input
          value={strValue}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="ID do card conectado..."
          className="text-sm font-mono text-xs"
        />
      )

    case 'attachment':
      return (
        <div className="space-y-1">
          {strValue && (
            <a href={strValue} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline break-all">
              {strValue}
            </a>
          )}
          <Input
            type="url"
            value={strValue}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            placeholder="URL do arquivo..."
            className="text-sm"
          />
        </div>
      )

    case 'assignee_select':
      return (
        <Input
          value={strValue}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="Nome do responsável..."
          className="text-sm"
        />
      )

    case 'statement':
      return (
        <p className="text-sm text-muted-foreground bg-muted/30 rounded px-3 py-2">{strValue}</p>
      )

    default:
      return (
        <Input
          value={strValue}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="text-sm"
        />
      )
  }
}
