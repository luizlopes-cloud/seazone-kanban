// Auto-generated types from Supabase schema.
// Regenerate with: npx supabase gen types typescript --project-id <new-project-id> > types/database.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

type Row<T> = { Row: T; Insert: Partial<T>; Update: Partial<T>; Relationships: [] }

export interface Database {
  public: {
    Tables: {
      pipes: Row<{
        id: string
        pipefy_id: number | null
        name: string
        slug: string
        color: string
        position: number
        created_at: string
      }>
      phases: Row<{
        id: string
        pipe_id: string
        pipefy_id: number | null
        name: string
        position: number
        is_standby: boolean
        is_done: boolean
        color: string | null
        created_at: string
      }>
      pipe_fields: Row<{
        id: string
        pipe_id: string
        pipefy_id: string | null
        label: string
        key: string
        type: string
        options: Json | null
        connector_pipe_id: string | null
        position: number
        required: boolean
        editable: boolean
        created_at: string
      }>
      cards: Row<{
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
      }>
      card_connections: Row<{
        id: string
        source_card_id: string
        target_card_id: string
        field_key: string
        created_at: string
      }>
      card_activities: Row<{
        id: string
        card_id: string
        user_id: string | null
        type: string
        payload: Json
        created_at: string
      }>
      automation_rules: Row<{
        id: string
        pipe_id: string
        pipefy_id: number | null
        name: string
        active: boolean
        trigger_type: string
        trigger_config: Json
        action_type: string
        action_config: Json
        created_at: string
      }>
      field_conditionals: Row<{
        id: string
        pipe_id: string
        pipefy_id: string | null
        target_field_id: string
        action: string
        operator: string
        conditions: Json
        created_at: string
      }>
      webhook_endpoints: Row<{
        id: string
        pipe_id: string | null
        url: string
        events: string[]
        active: boolean
        description: string | null
        created_at: string
      }>
      webhook_deliveries: Row<{
        id: string
        endpoint_id: string | null
        card_id: string | null
        url: string
        event_type: string
        payload: Json | null
        status_code: number | null
        error: string | null
        delivered_at: string
      }>
      standby_entries: Row<{
        id: string
        card_id: string
        imovel_code: string | null
        origin_phase_id: string | null
        reason: string
        entry_date: string
        exit_date: string | null
        active: boolean
        notes: string | null
        created_at: string
      }>
      profiles: Row<{
        id: string
        name: string | null
        email: string | null
        avatar_url: string | null
        role: string
        created_at: string
      }>
    }
    Views: Record<string, { Row: Record<string, unknown>; Relationships: [] }>
    Functions: Record<string, { Args: Record<string, unknown>; Returns: unknown }>
    Enums: Record<string, never>
  }
}
