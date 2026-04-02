import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { CardDetail } from '@/components/card/CardDetail'
import type { Card, PipeField, Phase, FieldConditional, CardActivity } from '@/types/domain'
import { Database } from '@/types/database'
import { SupabaseClient } from '@supabase/supabase-js'

interface Props {
  params: Promise<{ id: string }>
}

async function getCardData(supabase: SupabaseClient<Database>, id: string) {
  const { data: card, error: cardError } = await supabase
    .from('cards')
    .select('*')
    .eq('id', id)
    .single()

  if (cardError) {
    console.error("Error fetching card:", cardError)
    return null;
  }

  if (!card) return null;

  const { data: pipeData, error: pipeError } = await supabase
    .from('pipes')
    .select('id, name')
    .eq('id', card.pipe_id)
    .single();

  if (pipeError) {
    console.error("Error fetching pipe:", pipeError);
    return null;
  }

  if (!pipeData) return null;

  const { data: fields, error: fieldsError } = await supabase
    .from('pipe_fields')
    .select('*')
    .eq('pipe_id', card.pipe_id)
    .order('position');

  if (fieldsError) {
    console.error("Error fetching pipe fields:", fieldsError);
    return null;
  }

  const { data: phases, error: phasesError } = await supabase
    .from('phases')
    .select('*')
    .eq('pipe_id', card.pipe_id)
    .order('position');

  if (phasesError) {
    console.error("Error fetching phases:", phasesError);
    return null;
  }

  const { data: conditionals, error: conditionalsError } = await supabase
    .from('field_conditionals')
    .select('*')
    .eq('pipe_id', card.pipe_id);

  if (conditionalsError) {
    console.error("Error fetching field conditionals:", conditionalsError);
    return null;
  }

  const { data: activities, error: activitiesError } = await supabase
    .from('card_activities')
    .select('*')
    .eq('card_id', id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (activitiesError) {
    console.error("Error fetching card activities:", activitiesError);
    return null;
  }

  return {
    card,
    fields: fields || [],
    phases: phases || [],
    conditionals: conditionals || [],
    activities: activities || [],
  };
}


export default async function CardPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const cardData = await getCardData(supabase, id);

  if (!cardData) notFound();

  const { card, fields, phases, conditionals, activities } = cardData;

  return (
    <CardDetail
      card={card as Card}
      fields={fields as PipeField[]}
      phases={phases as Phase[]}
      conditionals={conditionals as FieldConditional[]}
      activities={activities as CardActivity[]}
    />
  )
}