'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { runAutomations } from '@/lib/automation/engine'

interface CreateCardInput {
  title: string
  pipeId: string
  phaseId: string
}

export async function createCard({ title, pipeId, phaseId }: CreateCardInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: card, error } = await supabase
    .from('cards')
    .insert({ title, pipe_id: pipeId, phase_id: phaseId })
    .select()
    .single()

  if (error || !card) throw new Error(error?.message ?? 'Erro ao criar card')

  // Log activity
  await supabase.from('card_activities').insert({
    card_id: card.id,
    user_id: user?.id,
    type: 'card_created',
    payload: { title, phase_id: phaseId },
  })

  // Run automations
  await runAutomations({
    type: 'card_created',
    card,
    userId: user?.id,
  }, supabase)

  revalidatePath(`/pipe/[slug]`, 'page')
  return card
}

export async function updateCardField(cardId: string, fieldKey: string, value: unknown) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get current card
  const { data: currentCard } = await supabase
    .from('cards')
    .select('*')
    .eq('id', cardId)
    .single()

  if (!currentCard) throw new Error('Card não encontrado')

  const oldValue = currentCard.fields?.[fieldKey]

  const { data: card, error } = await supabase
    .from('cards')
    .update({ fields: { ...currentCard.fields, [fieldKey]: value } })
    .eq('id', cardId)
    .select()
    .single()

  if (error || !card) throw new Error(error?.message ?? 'Erro ao atualizar campo')

  // Log activity
  await supabase.from('card_activities').insert({
    card_id: cardId,
    user_id: user?.id,
    type: 'field_update',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload: { field_key: fieldKey, old_value: oldValue, new_value: value } as any,
  })

  // Run automations
  await runAutomations({
    type: 'field_updated',
    card,
    oldCard: currentCard,
    fieldKey,
    oldValue,
    newValue: value,
    userId: user?.id,
  }, supabase)

  revalidatePath(`/card/${cardId}`)
  return card
}

export async function deleteCard(cardId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('cards')
    .delete()
    .eq('id', cardId)

  if (error) throw new Error(error.message)

  revalidatePath('/pipe/[slug]', 'page')
}
