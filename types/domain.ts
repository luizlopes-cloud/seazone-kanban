// Domain types for Seazone Kanban

export type FieldType =
  | 'short_text'
  | 'long_text'
  | 'radio_vertical'
  | 'radio_horizontal'
  | 'select'
  | 'label_select'
  | 'date'
  | 'datetime'
  | 'due_date'
  | 'checklist_vertical'
  | 'checklist_horizontal'
  | 'connector'
  | 'attachment'
  | 'assignee_select'
  | 'number'
  | 'currency'
  | 'statement'

export interface Pipe {
  id: string
  pipefy_id: number | null
  name: string
  slug: string
  color: string
  position: number
  created_at: string
}

export interface Phase {
  id: string
  pipe_id: string
  pipefy_id: number | null
  name: string
  position: number
  is_standby: boolean
  is_done: boolean
  color: string | null
  created_at: string
}

export interface PipeField {
  id: string
  pipe_id: string
  pipefy_id: string | null
  label: string
  key: string
  type: FieldType
  options: FieldOption[] | string[] | null
  connector_pipe_id: string | null
  position: number
  required: boolean
  editable: boolean
}

export interface FieldOption {
  label: string
  value: string
}

export interface Card {
  id: string
  pipe_id: string
  phase_id: string | null
  pipefy_id: number | null
  title: string
  fields: Record<string, unknown>
  assignee_ids: string[] | null
  due_date: string | null
  is_standby: boolean
  standby_due_date: string | null
  position: number
  created_at: string
  updated_at: string
  // Joined
  phase?: Phase
  pipe?: Pipe
}

export interface CardConnection {
  id: string
  source_card_id: string
  target_card_id: string
  field_key: string
  created_at: string
  target_card?: Card
}

export interface CardActivity {
  id: string
  card_id: string
  user_id: string | null
  type: ActivityType
  payload: Record<string, unknown>
  created_at: string
  profile?: Profile
}

export type ActivityType =
  | 'card_created'
  | 'phase_move'
  | 'field_update'
  | 'standby_on'
  | 'standby_off'
  | 'comment'
  | 'automation_fired'

export interface Profile {
  id: string
  name: string | null
  email: string | null
  avatar_url: string | null
  role: 'admin' | 'operator' | 'viewer'
}

export interface AutomationRule {
  id: string
  pipe_id: string
  name: string
  active: boolean
  trigger_type: TriggerType
  trigger_config: Record<string, unknown>
  action_type: ActionType
  action_config: Record<string, unknown>
}

export type TriggerType = 'card_created' | 'card_moved' | 'field_updated' | 'card_done'
export type ActionType = 'move_card' | 'fill_field' | 'create_card' | 'send_webhook' | 'standby_on' | 'standby_off'

export interface FieldConditional {
  id: string
  pipe_id: string
  target_field_id: string
  action: 'show' | 'hide'
  operator: 'and' | 'or'
  conditions: ConditionalRule[]
}

export interface ConditionalRule {
  field_key: string
  condition_type: 'equals' | 'not_equals' | 'present' | 'blank' | 'string_contains' | 'labels_equals'
  value?: string
}

export interface StandbyEntry {
  id: string
  card_id: string
  imovel_code: string | null
  origin_phase_id: string | null
  reason: StandbyReason
  entry_date: string
  exit_date: string | null
  active: boolean
  notes: string | null
}

export const STANDBY_REASONS: StandbyReason[] = [
  'Construção/Reforma',
  'Indisponibilidade proprietário',
  'Problema documentação',
  'Aguardando mobiliário',
  'Negociação em andamento',
  'Problema jurídico',
  'Reforma solicitada pelo proprietário',
  'Problema estrutural',
  'Aguardando aprovação condomínio',
  'Questão tributária',
  'Outros',
  'Stand-by temporário',
]

export type StandbyReason =
  | 'Construção/Reforma'
  | 'Indisponibilidade proprietário'
  | 'Problema documentação'
  | 'Aguardando mobiliário'
  | 'Negociação em andamento'
  | 'Problema jurídico'
  | 'Reforma solicitada pelo proprietário'
  | 'Problema estrutural'
  | 'Aguardando aprovação condomínio'
  | 'Questão tributária'
  | 'Outros'
  | 'Stand-by temporário'

// Board data bundled for server-to-client
export interface BoardData {
  pipe: Pipe
  phases: Phase[]
  cards: Card[]
  fields: PipeField[]
}

// Automation event types
export interface AutomationEvent {
  type: TriggerType
  card: Card
  oldCard?: Card
  fromPhaseId?: string
  toPhaseId?: string
  fieldKey?: string
  oldValue?: unknown
  newValue?: unknown
  userId?: string
}
