import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { runAutomations } from '@/lib/automation/engine'
import { revalidatePath } from 'next/cache'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { toPhaseId } = await request.json()

  const { data: currentCard } = await supabase.from('cards').select('*').eq('id', id).single()
  if (!currentCard) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: toPhase } = await supabase.from('phases').select('*').eq('id', toPhaseId).single()

  const { data: card, error } = await supabase
    .from('cards')
    .update({ phase_id: toPhaseId, is_standby: toPhase?.is_standby ?? false })
    .eq('id', id)
    .select()
    .single()

  if (error || !card) return NextResponse.json({ error: error?.message }, { status: 500 })

  await supabase.from('card_activities').insert({
    card_id: id,
    user_id: user.id,
    type: 'phase_move',
    payload: { from_phase_id: currentCard.phase_id, to_phase_id: toPhaseId },
  })

  await runAutomations({
    type: 'card_moved',
    card,
    oldCard: currentCard,
    fromPhaseId: currentCard.phase_id ?? undefined,
    toPhaseId,
    userId: user.id,
  }, supabase)

  revalidatePath('/pipe/[slug]', 'page')
  return NextResponse.json(card)
}
