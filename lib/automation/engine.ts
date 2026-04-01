import type { AutomationEvent } from '@/types/domain'
import type { SupabaseClient } from '@supabase/supabase-js'
import { executeAction } from './actions'

export async function runAutomations(event: AutomationEvent, supabase: SupabaseClient) {
  try {
    // Load active automation rules for this pipe
    const { data: rules } = await supabase
      .from('automation_rules')
      .select('*')
      .eq('pipe_id', event.card.pipe_id)
      .eq('active', true)

    if (!rules?.length) return

    // Get phase info if needed for card_moved events
    let toPhaseIsStandby = false
    let fromPhaseIsStandby = false

    if (event.type === 'card_moved') {
      if (event.toPhaseId) {
        const { data: toPhase } = await supabase
          .from('phases')
          .select('is_standby')
          .eq('id', event.toPhaseId)
          .single()
        toPhaseIsStandby = toPhase?.is_standby ?? false
      }
      if (event.fromPhaseId) {
        const { data: fromPhase } = await supabase
          .from('phases')
          .select('is_standby')
          .eq('id', event.fromPhaseId)
          .single()
        fromPhaseIsStandby = fromPhase?.is_standby ?? false
      }
    }

    for (const rule of rules) {
      if (!matchesTrigger(event, rule, { toPhaseIsStandby, fromPhaseIsStandby })) continue

      try {
        await executeAction(rule, event, supabase)

        // Log automation fired
        await supabase.from('card_activities').insert({
          card_id: event.card.id,
          user_id: null,
          type: 'automation_fired',
          payload: { rule_id: rule.id, rule_name: rule.name, action_type: rule.action_type },
        })
      } catch (err) {
        console.error(`Automation "${rule.name}" failed:`, err)
      }
    }
  } catch (err) {
    console.error('runAutomations error:', err)
  }
}

function matchesTrigger(
  event: AutomationEvent,
  rule: Record<string, unknown>,
  ctx: { toPhaseIsStandby: boolean; fromPhaseIsStandby: boolean }
): boolean {
  if (rule.trigger_type !== event.type) return false

  const cfg = (rule.trigger_config ?? {}) as Record<string, unknown>

  switch (event.type) {
    case 'card_created':
      return true

    case 'card_moved':
      if (cfg.to_phase_id && cfg.to_phase_id !== event.toPhaseId) return false
      if (cfg.from_phase_id && cfg.from_phase_id !== event.fromPhaseId) return false
      if (cfg.to_is_standby === true && !ctx.toPhaseIsStandby) return false
      if (cfg.from_is_standby === true && !ctx.fromPhaseIsStandby) return false
      return true

    case 'field_updated':
      if (cfg.field_key && cfg.field_key !== event.fieldKey) return false
      if (cfg.field_value !== undefined && cfg.field_value !== event.newValue) return false
      return true

    case 'card_done':
      return true

    default:
      return false
  }
}
