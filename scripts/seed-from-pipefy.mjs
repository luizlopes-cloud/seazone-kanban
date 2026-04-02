#!/usr/bin/env node
// Migrates cards from Pipefy to Supabase
// Usage: node scripts/seed-from-pipefy.mjs

const PIPEFY_TOKEN = 'eyJhbGciOiJIUzUxMiJ9.eyJpc3MiOiJQaXBlZnkiLCJpYXQiOjE3NzQ4OTE2MTEsImp0aSI6IjI4ZDI2ZTZjLWJiMzgtNDhiOS1iNWJmLWYwNjkxMmU4ZWU0YyIsInN1YiI6MzAyNDEyMDMzLCJ1c2VyIjp7ImlkIjozMDI0MTIwMzMsImVtYWlsIjoibC5sb3Blc0BzZWF6b25lLmNvbS5iciJ9LCJ1c2VyX3R5cGUiOiJhdXRoZW50aWNhdGVkIn0.kmwHr_fmWynvCfBY0W1vBAHlwFPpxa86iT1Y3YlyxvdZFbtA49TaKwYgGJ4bwfznBZIBTiF_jMe0H_IDuXJexg'
const SUPABASE_URL = 'https://fxjpnamoafzomqlncdyn.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4anBuYW1vYWZ6b21xbG5jZHluIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTA3MzQxMCwiZXhwIjoyMDkwNjQ5NDEwfQ.q9UneiieHfyibtrwmeBk_cGAWSvENBAULlGOEDuGfdk'

const PIPE_IDS = [303807224, 303781436, 303828424, 302290867, 302290880, 303024105]
const PIPE_SLUGS = ['onboarding', 'implantacao', 'adequacao', 'vistorias', 'fotos', 'anuncios']

async function pipefyQuery(query, variables = {}) {
  const res = await fetch('https://api.pipefy.com/graphql', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${PIPEFY_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  })
  const json = await res.json()
  if (json.errors) throw new Error(JSON.stringify(json.errors))
  return json.data
}

async function supabaseGet(path) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
  })
  return res.json()
}

async function supabasePost(path, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
    body: JSON.stringify(body),
  })
  return res.json()
}

async function supabasePatch(path, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method: 'PATCH',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  return res.json()
}

// Fetch cards from one Pipefy pipe (up to 20)
async function fetchPipefyCards(pipeId) {
  const query = `
    query($pipeId: ID!, $after: String) {
      cards(pipe_id: $pipeId, first: 20, after: $after) {
        edges {
          node {
            id
            title
            current_phase { id name }
            due_date
            created_at
            updated_at
            fields { field { id label internal_id } value }
          }
        }
      }
    }
  `
  const data = await pipefyQuery(query, { pipeId: String(pipeId) })
  return data.cards.edges.map(e => e.node)
}

// Normalize field values (Pipefy returns arrays for some types)
function normalizeValue(val) {
  if (!val || val === '[]' || val === '') return null
  try {
    const parsed = JSON.parse(val)
    if (Array.isArray(parsed)) return parsed.length === 1 ? parsed[0] : parsed.length === 0 ? null : parsed
    return parsed
  } catch { return val }
}

// Build fields JSONB from Pipefy card fields — use field.id (readable key)
function buildFields(pipefyFields) {
  const result = {}
  for (const f of pipefyFields) {
    const val = normalizeValue(f.value)
    if (val === null) continue
    result[f.field.id] = val
  }
  return result
}

async function main() {
  console.log('Loading Supabase phases...')
  const phases = await supabaseGet('phases?select=id,pipe_id,pipefy_id,name,is_standby')
  const pipes = await supabaseGet('pipes?select=id,pipefy_id,slug')

  // Maps: pipefy_phase_id (number) -> supabase phase
  const phaseByPipefyId = {}
  const phaseByPipeAndName = {}
  for (const ph of phases) {
    if (ph.pipefy_id) phaseByPipefyId[ph.pipefy_id] = ph
    phaseByPipeAndName[`${ph.pipe_id}:${ph.name}`] = ph
  }

  const pipeByPipefyId = {}
  const pipeBySlug = {}
  for (const p of pipes) {
    if (p.pipefy_id) pipeByPipefyId[p.pipefy_id] = p
    pipeBySlug[p.slug] = p
  }

  // pipefy_card_id -> supabase_card_id (for connector linking)
  const cardIdMap = {}

  console.log('\nFetching cards from Pipefy...')
  const allCardsByPipe = []

  for (let i = 0; i < PIPE_IDS.length; i++) {
    const pipefyPipeId = PIPE_IDS[i]
    const slug = PIPE_SLUGS[i]
    const supabasePipe = pipeBySlug[slug]
    if (!supabasePipe) { console.log(`  SKIP: no pipe for ${slug}`); continue }

    console.log(`  Fetching PIPE ${i} (${slug}) — pipefy_id ${pipefyPipeId}...`)
    let cards = []
    try {
      cards = await fetchPipefyCards(pipefyPipeId)
    } catch (e) {
      console.log(`    ERROR: ${e.message}`)
      continue
    }
    console.log(`    Got ${cards.length} cards`)
    allCardsByPipe.push({ slug, supabasePipe, pipefyPipeId, cards })
    await new Promise(r => setTimeout(r, 500)) // rate limit
  }

  // First pass: insert all cards
  console.log('\nInserting cards into Supabase...')
  for (const { slug, supabasePipe, cards } of allCardsByPipe) {
    for (const card of cards) {
      // Find phase
      let phase = phaseByPipefyId[parseInt(card.current_phase?.id)]
      if (!phase) {
        // fallback: match by name within this pipe
        phase = phaseByPipeAndName[`${supabasePipe.id}:${card.current_phase?.name}`]
      }
      if (!phase) {
        // fallback: first phase of the pipe
        phase = phases.find(p => p.pipe_id === supabasePipe.id)
      }

      const fields = buildFields(card.fields || [])

      const row = {
        pipe_id: supabasePipe.id,
        phase_id: phase?.id ?? null,
        pipefy_id: parseInt(card.id),
        title: card.title || 'Sem título',
        fields,
        is_standby: phase?.is_standby ?? false,
        due_date: card.due_date || null,
        position: 0,
      }

      const inserted = await supabasePost('cards', row)
      if (inserted && inserted[0]?.id) {
        cardIdMap[card.id] = inserted[0].id
        process.stdout.write('.')
      } else {
        process.stdout.write('x')
        if (inserted?.message) console.log(`\n  ERR: ${inserted.message}`)
      }
    }
    console.log(` (${slug})`)
  }

  // Second pass: link connector fields
  console.log('\nLinking connector fields...')
  let linked = 0
  for (const { cards } of allCardsByPipe) {
    for (const card of cards) {
      const supabaseId = cardIdMap[card.id]
      if (!supabaseId) continue

      const fields = buildFields(card.fields || [])
      let updated = false

      // Look for any field value that is a pipefy card ID in our map
      for (const [key, val] of Object.entries(fields)) {
        if (typeof val === 'string' && cardIdMap[val]) {
          fields[key] = cardIdMap[val]
          updated = true
        }
      }

      if (updated) {
        await supabasePatch(`cards?id=eq.${supabaseId}`, { fields })
        linked++
      }
    }
  }

  console.log(`\nDone! Linked ${linked} connector fields.`)
  console.log(`Total cards inserted: ${Object.keys(cardIdMap).length}`)
}

main().catch(console.error)
