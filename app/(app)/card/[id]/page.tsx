import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { CardDetail } from '@/components/card/CardDetail'
import type { Card, PipeField, Phase, FieldConditional, CardActivity } from '@/types/domain'
import { Database } from '@/types/database'
import { SupabaseClient } from '@supabase/supabase-js'

interface Props {
  params: Promise<{ id: string }>
}

interface CardResult extends Database['public']['Tables']['cards']['Row'] {
  pipes: Database['public']['Tables']['pipes']['Row'];
  pipe_fields: (Database['public']['Tables']['pipe_fields']['Row'] & {
    field_conditionals: Database['public']['Tables']['field_conditionals']['Row'][]
  })[];
  phases: Database['public']['Tables']['phases']['Row'];
  card_activities: Database['public']['Tables']['card_activities']['Row'][]
}

async function getCardData(supabase: SupabaseClient<Database>, id: string) {
  try {
    const { data, error } = await supabase
      .from('cards')
      .select(`
        *,
        pipes (
          id,
          name
        ),
        pipe_fields (
          *,
          field_conditionals (*)
        ),
        phases (
          *
        ),
        card_activities (
          *
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error("Error fetching card data:", error);
      throw error;
    }

    if (!data) {
      return null;
    }

    const card = data as CardResult;

    return {
      card: card,
      fields: card.pipe_fields || [],
      phases: card.phases || [],
      conditionals: card.pipe_fields?.flatMap(field => field.field_conditionals) || [],
      activities: card.card_activities || [],
    };
  } catch (error: any) {
    console.error("Error in getCardData:", error);
    throw new Error(`Failed to fetch card data: ${error.message}`);
  }
}


export default async function CardPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  try {
    const cardData = await getCardData(supabase, id);

    if (!cardData) notFound();

    const { card, fields, phases, conditionals, activities } = cardData;

    return (
      <CardDetail
        card={card}
        fields={fields}
        phases={phases}
        conditionals={conditionals}
        activities={activities}
      />
    )
  } catch (error: any) {
    console.error("Error in CardPage:", error);
    notFound();
  }
}