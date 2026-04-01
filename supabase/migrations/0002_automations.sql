-- ============================================================
-- SEAZONE KANBAN — AUTOMATIONS & CONDITIONALS
-- ============================================================

-- Automation rules
CREATE TABLE automation_rules (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pipe_id        uuid NOT NULL REFERENCES pipes(id) ON DELETE CASCADE,
  pipefy_id      bigint UNIQUE,
  name           text NOT NULL,
  active         boolean DEFAULT true,
  trigger_type   text NOT NULL,
  -- trigger_type: 'card_created' | 'card_moved' | 'field_updated' | 'card_done'
  trigger_config jsonb DEFAULT '{}',
  -- card_created: {}
  -- card_moved: { from_phase_id?, to_phase_id?, to_is_standby? }
  -- field_updated: { field_key, field_value? }
  -- card_done: {}
  action_type    text NOT NULL,
  -- action_type: 'move_card' | 'fill_field' | 'create_card' | 'send_webhook' | 'standby_on' | 'standby_off'
  action_config  jsonb DEFAULT '{}',
  -- move_card: { to_phase_id }
  -- fill_field: { field_key, value | value_from_field }
  -- create_card: { target_pipe_id, copy_fields[], connect_field?, title_prefix? }
  -- send_webhook: { url, event_type? }
  -- standby_on: { fill_date_field? }
  -- standby_off: {}
  created_at     timestamptz DEFAULT now()
);

CREATE INDEX automation_rules_pipe_idx ON automation_rules(pipe_id) WHERE active = true;

-- Field conditionals (show/hide fields)
CREATE TABLE field_conditionals (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pipe_id          uuid NOT NULL REFERENCES pipes(id) ON DELETE CASCADE,
  pipefy_id        text UNIQUE,
  target_field_id  uuid NOT NULL REFERENCES pipe_fields(id) ON DELETE CASCADE,
  action           text NOT NULL,   -- 'show' | 'hide'
  operator         text NOT NULL,   -- 'and' | 'or'
  conditions       jsonb NOT NULL,
  -- [{ field_key, condition_type, value }]
  -- condition_type: 'equals' | 'not_equals' | 'present' | 'blank' | 'string_contains' | 'labels_equals'
  created_at       timestamptz DEFAULT now()
);

CREATE INDEX field_conditionals_pipe_idx ON field_conditionals(pipe_id);

-- Webhook endpoints to forward events to
CREATE TABLE webhook_endpoints (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pipe_id     uuid REFERENCES pipes(id) ON DELETE CASCADE,   -- null = all pipes
  url         text NOT NULL,
  events      text[] DEFAULT ARRAY['card_created','card_moved','card_field_updated','card_done'],
  active      boolean DEFAULT true,
  description text,
  created_at  timestamptz DEFAULT now()
);

-- Outbound webhook delivery log
CREATE TABLE webhook_deliveries (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint_id  uuid REFERENCES webhook_endpoints(id),
  card_id      uuid REFERENCES cards(id),
  url          text NOT NULL,
  event_type   text NOT NULL,
  payload      jsonb,
  status_code  integer,
  error        text,
  delivered_at timestamptz DEFAULT now()
);

-- Stand-by registry (replicates Pipefy DB 305579258)
CREATE TABLE standby_entries (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id         uuid NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  imovel_code     text,
  origin_phase_id uuid REFERENCES phases(id),
  reason          text NOT NULL,
  entry_date      date NOT NULL DEFAULT current_date,
  exit_date       date,
  active          boolean DEFAULT true,
  notes           text,
  created_at      timestamptz DEFAULT now()
);

CREATE INDEX standby_entries_card_idx ON standby_entries(card_id);
CREATE INDEX standby_entries_active_idx ON standby_entries(active) WHERE active = true;

-- Standby reason options (mirrors Pipefy DB field)
COMMENT ON COLUMN standby_entries.reason IS
  'Options: Construção/Reforma | Indisponibilidade proprietário | Problema documentação | '
  'Aguardando mobiliário | Negociação em andamento | Problema jurídico | '
  'Reforma solicitada pelo proprietário | Problema estrutural | '
  'Aguardando aprovação condomínio | Questão tributária | Outros | Stand-by temporário';
