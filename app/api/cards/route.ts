import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { runAutomations } from '@/lib/automation/engine'
import { revalidatePath } from 'next/cache'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const pipeId = searchParams.get('pipe_id')
  const phaseId = searchParams.get('phase_id')

  let query = supabase.from('cards').select('*').order('position')
  if (pipeId) query = query.eq('pipe_id', pipeId)
  if (phaseId) query = query.eq('phase_id', phaseId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { title, pipe_id, phase_id, fields } = body

  const { data: card, error } = await supabase
    .from('cards')
    .insert({ title, pipe_id, phase_id, fields: fields ?? {} })
    .select()
    .single()

  if (error || !card) return NextResponse.json({ error: error?.message }, { status: 500 })

  await supabase.from('card_activities').insert({
    card_id: card.id,
    user_id: user.id,
    type: 'card_created',
    payload: { title, phase_id },
  })

  await runAutomations({ type: 'card_created', card, userId: user.id }, supabase)

  revalidatePath('/pipe/[slug]', 'page')
  return NextResponse.json(card, { status: 201 })
}
