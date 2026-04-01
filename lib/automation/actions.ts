import type { AutomationEvent } from '@/types/domain'
import type { SupabaseClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

export async function executeAction(
  rule: Record<string, unknown>,
  event: AutomationEvent,
  supabase: SupabaseClient
) {
  const cfg = (rule.action_config ?? {}) as Record<string, unknown>

  switch (rule.action_type) {
    case 'fill_field':
      await fillField(cfg, event, supabase)
      break
    case 'move_card':
      await movePipeCard(cfg, event, supabase)
      break
    case 'create_card':
      await createLinkedCard(cfg, event, supabase)
      break
    case 'standby_on':
      await handleStandbyOn(cfg, event, supabase)
      break
    case 'standby_off':
      await handleStandbyOff(event, supabase)
      break
    case 'send_webhook':
      await sendWebhook(cfg, event, supabase)
      break
  }
}

async function fillField(
  cfg: Record<string, unknown>,
  event: AutomationEvent,
  supabase: SupabaseClient
) {
  const { field_key, value, value_from, target, target_field, target_pipe_id } = cfg

  let targetCardId = event.card.id
  let targetFields = { ...event.card.fields }

  // If targeting a connected card
  if (target === 'connected_card' && target_field) {
    const connectedCardId = event.card.fields?.[target_field as string] as string
    if (!connectedCardId) return

    const { data: connectedCard } = await supabase
      .from('cards')
      .select('*')
      .eq('id', connectedCardId)
      .single()

    if (!connectedCard) return
    targetCardId = connectedCard.id
    targetFields = { ...connectedCard.fields }
  }

  const finalValue = value_from === 'now' ? new Date().toISOString() : value

  await supabase
    .from('cards')
    .update({ fields: { ...targetFields, [field_key as string]: finalValue } })
    .eq('id', targetCardId)
}

async function movePipeCard(
  cfg: Record<string, unknown>,
  event: AutomationEvent,
  supabase: SupabaseClient
) {
  const { to_phase_id } = cfg
  if (!to_phase_id) return

  await supabase
    .from('cards')
    .update({ phase_id: to_phase_id })
    .eq('id', event.card.id)

  revalidatePath('/pipe/[slug]', 'page')
}

async function createLinkedCard(
  cfg: Record<string, unknown>,
  event: AutomationEvent,
  supabase: SupabaseClient
) {
  const { target_pipe_id, copy_fields = [], connect_target_field, title_prefix = '' } = cfg

  if (!target_pipe_id) return

  // Get first (non-standby, non-done) phase of target pipe
  const { data: targetPhase } = await supabase
    .from('phases')
    .select('id')
    .eq('pipe_id', target_pipe_id)
    .eq('is_standby', false)
    .eq('is_done', false)
    .order('position')
    .limit(1)
    .single()

  if (!targetPhase) return

  // Copy specified fields
  const copiedFields: Record<string, unknown> = {}
  for (const key of copy_fields as string[]) {
    if (event.card.fields?.[key] !== undefined) {
      copiedFields[key] = event.card.fields[key]
    }
  }

  // Add connector back to source card if field specified
  if (connect_target_field) {
    copiedFields[connect_target_field as string] = event.card.id
  }

  const { data: newCard } = await supabase
    .from('cards')
    .insert({
      title: `${title_prefix}${event.card.title}`,
      pipe_id: target_pipe_id,
      phase_id: targetPhase.id,
      fields: copiedFields,
    })
    .select()
    .single()

  // Create connection record
  if (newCard) {
    await supabase.from('card_connections').insert({
      source_card_id: event.card.id,
      target_card_id: newCard.id,
      field_key: (connect_target_field as string) ?? 'auto_created',
    })
  }

  revalidatePath('/pipe/[slug]', 'page')
}

async function handleStandbyOn(
  cfg: Record<string, unknown>,
  event: AutomationEvent,
  supabase: SupabaseClient
) {
  const updates: Record<string, unknown> = { is_standby: true }

  if (cfg.fill_date_field) {
    updates.fields = {
      ...event.card.fields,
      [cfg.fill_date_field as string]: new Date().toISOString().split('T')[0],
    }
  }

  await supabase.from('cards').update(updates).eq('id', event.card.id)
}

async function handleStandbyOff(event: AutomationEvent, supabase: SupabaseClient) {
  await supabase
    .from('cards')
    .update({ is_standby: false, standby_due_date: null })
    .eq('id', event.card.id)

  // Close any active standby entries
  await supabase
    .from('standby_entries')
    .update({ active: false, exit_date: new Date().toISOString().split('T')[0] })
    .eq('card_id', event.card.id)
    .eq('active', true)
}

async function sendWebhook(
  cfg: Record<string, unknown>,
  event: AutomationEvent,
  supabase: SupabaseClient
) {
  // Load active webhook endpoints for this pipe (or global)
  const { data: endpoints } = await supabase
    .from('webhook_endpoints')
    .select('*')
    .or(`pipe_id.eq.${event.card.pipe_id},pipe_id.is.null`)
    .eq('active', true)

  if (!endpoints?.length) return

  const eventType = `card.${event.type.replace('card_', '').replace('_updated', '_update')}`
  const payload = {
    event: eventType,
    card: {
      id: event.card.id,
      title: event.card.title,
      pipe_id: event.card.pipe_id,
      phase_id: event.card.phase_id,
      fields: event.card.fields,
      pipefy_id: event.card.pipefy_id,
    },
    from_phase_id: event.fromPhaseId,
    to_phase_id: event.toPhaseId,
    field_key: event.fieldKey,
    new_value: event.newValue,
    timestamp: new Date().toISOString(),
  }

  await Promise.allSettled(
    endpoints
      .filter((ep) => ep.events?.includes(eventType))
      .map(async (ep) => {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 5000)
        try {
          const res = await fetch(ep.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: controller.signal,
          })
          await supabase.from('webhook_deliveries').insert({
            endpoint_id: ep.id,
            card_id: event.card.id,
            url: ep.url,
            event_type: eventType,
            payload,
            status_code: res.status,
          })
        } catch {
          // Fire and forget — log silently
        } finally {
          clearTimeout(timeout)
        }
      })
  )
}
