import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { CardDetail } from '@/components/card/CardDetail'
import type { Card, PipeField, Phase, FieldConditional, CardActivity } from '@/types/domain'

interface Props {
  params: Promise<{ id: string }>
}

export default async function CardPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: card } = await supabase
    .from('cards')
    .select('*')
    .eq('id', id)
    .single()

  if (!card) notFound()

  const [{ data: fields }, { data: phases }, { data: conditionals }, { data: activities }] =
    await Promise.all([
      supabase.from('pipe_fields').select('*').eq('pipe_id', card.pipe_id).order('position'),
      supabase.from('phases').select('*').eq('pipe_id', card.pipe_id).order('position'),
      supabase.from('field_conditionals').select('*').eq('pipe_id', card.pipe_id),
      supabase
        .from('card_activities')
        .select('*')
        .eq('card_id', id)
        .order('created_at', { ascending: false })
        .limit(50),
    ])

  return (
    <CardDetail
      card={card as unknown as Card}
      fields={(fields ?? []) as unknown as PipeField[]}
      phases={(phases ?? []) as unknown as Phase[]}
      conditionals={(conditionals ?? []) as unknown as FieldConditional[]}
      activities={(activities ?? []) as unknown as CardActivity[]}
    />
  )
}
