import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { runAutomations } from '@/lib/automation/engine'
import { revalidatePath } from 'next/cache'

// Centralized logging function (replace with your actual logging system)
function logError(message: string, error: any, context?: any) {
  console.error(message, error, context);
  // In a real application, you would send this to a logging service like Sentry or Datadog
}


export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const pipeId = searchParams.get('pipe_id')
  const phaseId = searchParams.get('phase_id')

  let query = supabase.from('cards').select('*').order('position')
  if (pipeId) query = query.eq('pipe_id', pipeId)
  if (phaseId) query = query.eq('phase_id', phaseId)

  try {
    const { data, error } = await query
    if (error) {
      logError("Error fetching cards from Supabase:", error, { pipeId, phaseId });
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json(data)
  } catch (e: any) {
    logError("Unexpected error in GET cards:", e, { pipeId, phaseId });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const { title, pipe_id, phase_id, fields } = body

    // Input validation
    if (!title || typeof title !== 'string' || title.length > 255) {
      return NextResponse.json({ error: 'Invalid title' }, { status: 400 })
    }
    if (!pipe_id || typeof pipe_id !== 'string') {
      return NextResponse.json({ error: 'Invalid pipe_id' }, { status: 400 })
    }
    if (!phase_id || typeof phase_id !== 'string') {
      return NextResponse.json({ error: 'Invalid phase_id' }, { status: 400 })
    }
    if (fields && typeof fields !== 'object') {
      return NextResponse.json({ error: 'Invalid fields' }, { status: 400 })
    }


    const { data: card, error } = await supabase
      .from('cards')
      .insert({ title, pipe_id, phase_id, fields: fields ?? {} })
      .select()
      .single()

    if (error || !card) {
      logError("Error creating card in Supabase:", error, { title, pipe_id, phase_id, fields, userId: user.id });
      return NextResponse.json({ error: error?.message }, { status: 500 })
    }

    await supabase.from('card_activities').insert({
      card_id: card.id,
      user_id: user.id,
      type: 'card_created',
      payload: { title, phase_id },
    })

    await runAutomations({ type: 'card_created', card, userId: user.id }, supabase)

    revalidatePath('/pipe/[slug]', 'page')
    return NextResponse.json(card, { status: 201 })

  } catch (e: any) {
    logError("Unexpected error in POST cards:", e, { userId: user?.id });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}