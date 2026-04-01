'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { StandbyReason } from '@/types/domain'

export async function activateStandby(
  cardId: string,
  reason: StandbyReason,
  dueDate: string | null,
  originPhaseId: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get card details
  const { data: card } = await supabase
    .from('cards')
    .select('*')
    .eq('id', cardId)
    .single()

  if (!card) throw new Error('Card não encontrado')

  // Get standby phase for this pipe
  const { data: standbyPhase } = await supabase
    .from('phases')
    .select('*')
    .eq('pipe_id', card.pipe_id)
    .eq('is_standby', true)
    .single()

  // Update card
  await supabase
    .from('cards')
    .update({
      phase_id: standbyPhase?.id ?? card.phase_id,
      is_standby: true,
      standby_due_date: dueDate,
      fields: {
        ...card.fields,
        data_de_vencimento_do_prazo_de_stand_by: dueDate,
      },
    })
    .eq('id', cardId)

  // Insert standby entry
  await supabase.from('standby_entries').insert({
    card_id: cardId,
    imovel_code: card.fields?.codigo_imovel as string ?? null,
    origin_phase_id: originPhaseId,
    reason,
    entry_date: new Date().toISOString().split('T')[0],
    active: true,
  })

  // Log activity
  await supabase.from('card_activities').insert({
    card_id: cardId,
    user_id: user?.id,
    type: 'standby_on',
    payload: { reason, due_date: dueDate, origin_phase_id: originPhaseId },
  })

  revalidatePath('/pipe/[slug]', 'page')
  revalidatePath(`/card/${cardId}`)
}

export async function deactivateStandby(cardId: string, targetPhaseId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Deactivate active standby entry
  await supabase
    .from('standby_entries')
    .update({ active: false, exit_date: new Date().toISOString().split('T')[0] })
    .eq('card_id', cardId)
    .eq('active', true)

  // Update card
  await supabase
    .from('cards')
    .update({
      phase_id: targetPhaseId,
      is_standby: false,
      standby_due_date: null,
    })
    .eq('id', cardId)

  // Log activity
  await supabase.from('card_activities').insert({
    card_id: cardId,
    user_id: user?.id,
    type: 'standby_off',
    payload: { target_phase_id: targetPhaseId },
  })

  revalidatePath('/pipe/[slug]', 'page')
  revalidatePath(`/card/${cardId}`)
}
