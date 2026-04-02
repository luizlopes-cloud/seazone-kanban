#!/usr/bin/env node
// Sync real Pipefy field definitions into pipe_fields table

const PIPEFY_TOKEN = 'eyJhbGciOiJIUzUxMiJ9.eyJpc3MiOiJQaXBlZnkiLCJpYXQiOjE3NzQ4OTE2MTEsImp0aSI6IjI4ZDI2ZTZjLWJiMzgtNDhiOS1iNWJmLWYwNjkxMmU4ZWU0YyIsInN1YiI6MzAyNDEyMDMzLCJ1c2VyIjp7ImlkIjozMDI0MTIwMzMsImVtYWlsIjoibC5sb3Blc0BzZWF6b25lLmNvbS5iciJ9LCJ1c2VyX3R5cGUiOiJhdXRoZW50aWNhdGVkIn0.kmwHr_fmWynvCfBY0W1vBAHlwFPpxa86iT1Y3YlyxvdZFbtA49TaKwYgGJ4bwfznBZIBTiF_jMe0H_IDuXJexg'
const SUPABASE_URL = 'https://fxjpnamoafzomqlncdyn.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4anBuYW1vYWZ6b21xbG5jZHluIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTA3MzQxMCwiZXhwIjoyMDkwNjQ5NDEwfQ.q9UneiieHfyibtrwmeBk_cGAWSvENBAULlGOEDuGfdk'

const PIPES = [
  { supabaseId: '00000000-0000-0000-0000-000000000001', pipefyId: '303807224', slug: 'onboarding' },
  { supabaseId: '00000000-0000-0000-0000-000000000002', pipefyId: '303781436', slug: 'implantacao' },
  { supabaseId: '00000000-0000-0000-0000-000000000003', pipefyId: '303828424', slug: 'adequacao' },
  { supabaseId: '00000000-0000-0000-0000-000000000004', pipefyId: '302290867', slug: 'vistorias' },
  { supabaseId: '00000000-0000-0000-0000-000000000005', pipefyId: '302290880', slug: 'fotos' },
  { supabaseId: '00000000-0000-0000-0000-000000000006', pipefyId: '303024105', slug: 'anuncios' },
]

// Skip auto-generated / internal fields that clutter the form
const SKIP_TYPES = new Set(['connector', 'statement', 'checklist_vertical', 'checklist_horizontal'])
const SKIP_KEYS = new Set(['dono_do_card', 'lista_de_franquias_automa_o'])

async function pipefyQuery(query) {
  const res = await fetch('https://api.pipefy.com/graphql', {
    method: 'POST',
    headers: { Authorization: `Bearer ${PIPEFY_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  })
  const j = await res.json()
  if (j.errors) throw new Error(j.errors.map(e => e.message).join('; '))
  return j.data
}

async function sbGet(path) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
  })
  return r.json()
}

async function sbDelete(path) {
  await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method: 'DELETE',
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
  })
}

async function sbPost(path, body) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json', Prefer: 'return=minimal',
    },
    body: JSON.stringify(body),
  })
  if (!r.ok) { const t = await r.text(); console.error('  POST error:', t.slice(0, 200)) }
}

function mapType(pipefyType) {
  const map = {
    short_text: 'short_text', long_text: 'long_text',
    number: 'number', currency: 'currency', date: 'date', due_date: 'due_date',
    datetime: 'datetime', select: 'select', label_select: 'label_select',
    radio_vertical: 'radio_vertical', radio_horizontal: 'radio_horizontal',
    attachment: 'attachment', assignee_select: 'assignee_select',
    connector: 'connector', statement: 'statement',
    checklist_vertical: 'checklist_vertical', checklist_horizontal: 'checklist_horizontal',
  }
  return map[pipefyType] ?? 'short_text'
}

function parseOptions(optStr) {
  if (!optStr) return null
  try {
    const parsed = JSON.parse(optStr)
    if (Array.isArray(parsed)) return parsed.map(o => typeof o === 'string' ? { label: o, value: o } : o)
    return null
  } catch { return null }
}

async function main() {
  // Load phases from Supabase
  const phases = await sbGet('phases?select=id,pipe_id,pipefy_id,name')
  const phaseByPipefyId = {}
  phases.forEach(p => { if (p.pipefy_id) phaseByPipefyId[p.pipefy_id] = p })

  for (const pipe of PIPES) {
    console.log(`\nSyncing ${pipe.slug}...`)

    // Fetch pipe fields from Pipefy
    const data = await pipefyQuery(`{
      pipe(id: "${pipe.pipefyId}") {
        start_form_fields { id internal_id label type required editable options }
        phases {
          id name
          fields { id internal_id label type required editable options }
        }
      }
    }`)
    const p = data.pipe

    // Clear existing pipe_fields for this pipe
    await sbDelete(`pipe_fields?pipe_id=eq.${pipe.supabaseId}`)

    const rows = []
    let pos = 0

    // Start form fields (phase_id = null)
    for (const f of p.start_form_fields) {
      if (SKIP_TYPES.has(f.type) || SKIP_KEYS.has(f.id)) continue
      rows.push({
        pipe_id: pipe.supabaseId,
        phase_id: null,
        pipefy_id: f.id,
        label: f.label.trim(),
        key: f.id,
        type: mapType(f.type),
        options: parseOptions(f.options),
        required: f.required ?? false,
        editable: f.editable ?? true,
        position: pos++,
      })
    }

    // Phase-specific fields
    for (const phase of p.phases) {
      const supabasePhase = phaseByPipefyId[parseInt(phase.id)]
      if (!supabasePhase || supabasePhase.pipe_id !== pipe.supabaseId) continue

      for (const f of phase.fields) {
        if (SKIP_TYPES.has(f.type) || SKIP_KEYS.has(f.id)) continue
        rows.push({
          pipe_id: pipe.supabaseId,
          phase_id: supabasePhase.id,
          pipefy_id: f.id,
          label: f.label.trim(),
          key: f.id,
          type: mapType(f.type),
          options: parseOptions(f.options),
          required: f.required ?? false,
          editable: f.editable ?? true,
          position: pos++,
        })
      }
    }

    // Insert in batches of 50
    for (let i = 0; i < rows.length; i += 50) {
      await sbPost('pipe_fields', rows.slice(i, i + 50))
    }

    console.log(`  ${rows.length} fields synced (${p.start_form_fields.length} start form + phase fields)`)
    await new Promise(r => setTimeout(r, 400))
  }

  // Verify
  const total = await sbGet('pipe_fields?select=id')
  console.log(`\nTotal pipe_fields: ${total.length}`)
}

main().catch(console.error)
