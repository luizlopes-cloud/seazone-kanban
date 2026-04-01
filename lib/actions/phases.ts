'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { runAutomations } from '@/lib/automation/engine'

export async function moveCard(cardId: string, toPhaseId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get current card
  const { data: currentCard } = await supabase
    .from('cards')
    .select('*')
    .eq('id', cardId)
    .single()

  if (!currentCard) throw new Error('Card não encontrado')

  const fromPhaseId = currentCard.phase_id

  // Get destination phase
  const { data: toPhase } = await supabase
    .from('phases')
    .select('*')
    .eq('id', toPhaseId)
    .single()

  if (!toPhase) throw new Error('Fase não encontrada')

  // Update card
  const { data: card, error } = await supabase
    .from('cards')
    .update({
      phase_id: toPhaseId,
      is_standby: toPhase.is_standby,
    })
    .eq('id', cardId)
    .select()
    .single()

  if (error || !card) throw new Error(error?.message ?? 'Erro ao mover card')

  // Log activity
  await supabase.from('card_activities').insert({
    card_id: cardId,
    user_id: user?.id,
    type: 'phase_move',
    payload: { from_phase_id: fromPhaseId, to_phase_id: toPhaseId, to_phase_name: toPhase.name },
  })

  // Run automations
  await runAutomations({
    type: 'card_moved',
    card,
    oldCard: currentCard,
    fromPhaseId: fromPhaseId ?? undefined,
    toPhaseId,
    userId: user?.id,
  }, supabase)

  revalidatePath('/pipe/[slug]', 'page')
  return card
}
