-- ============================================================
-- SEAZONE KANBAN — CORE SCHEMA
-- ============================================================

-- Pipes (the 6 Pipefy pipelines)
CREATE TABLE pipes (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pipefy_id    bigint UNIQUE,
  name         text NOT NULL,
  slug         text UNIQUE NOT NULL,
  color        text DEFAULT '#6B7280',
  position     smallint NOT NULL,
  created_at   timestamptz DEFAULT now()
);

-- Phases within each pipe
CREATE TABLE phases (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pipe_id      uuid NOT NULL REFERENCES pipes(id) ON DELETE CASCADE,
  pipefy_id    bigint UNIQUE,
  name         text NOT NULL,
  position     smallint NOT NULL,
  is_standby   boolean DEFAULT false,
  is_done      boolean DEFAULT false,
  color        text,
  created_at   timestamptz DEFAULT now()
);

CREATE INDEX phases_pipe_id_idx ON phases(pipe_id, position);

-- Field definitions per pipe
CREATE TABLE pipe_fields (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pipe_id            uuid NOT NULL REFERENCES pipes(id) ON DELETE CASCADE,
  pipefy_id          text UNIQUE,
  label              text NOT NULL,
  key                text NOT NULL,
  type               text NOT NULL,
  -- type: short_text | long_text | radio_vertical | radio_horizontal |
  --       select | label_select | date | datetime | due_date |
  --       checklist_vertical | checklist_horizontal |
  --       connector | attachment | assignee_select |
  --       number | currency | statement
  options            jsonb,           -- [{label, value}] for select/radio
  connector_pipe_id  uuid REFERENCES pipes(id),
  position           smallint NOT NULL DEFAULT 0,
  required           boolean DEFAULT false,
  editable           boolean DEFAULT true,
  created_at         timestamptz DEFAULT now(),
  UNIQUE(pipe_id, key)
);

CREATE INDEX pipe_fields_pipe_id_idx ON pipe_fields(pipe_id, position);

-- Cards (main entity)
CREATE TABLE cards (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pipe_id          uuid NOT NULL REFERENCES pipes(id) ON DELETE CASCADE,
  phase_id         uuid REFERENCES phases(id),
  pipefy_id        bigint UNIQUE,
  title            text NOT NULL,
  fields           jsonb DEFAULT '{}',   -- { field_key: value, ... }
  assignee_ids     uuid[],
  due_date         date,
  is_standby       boolean DEFAULT false,
  standby_due_date date,
  position         integer DEFAULT 0,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

CREATE INDEX cards_pipe_phase_idx ON cards(pipe_id, phase_id);
CREATE INDEX cards_fields_gin ON cards USING gin(fields);
CREATE INDEX cards_pipefy_id_idx ON cards(pipefy_id) WHERE pipefy_id IS NOT NULL;

-- Cross-pipe connector links
CREATE TABLE card_connections (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_card_id  uuid NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  target_card_id  uuid NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  field_key       text NOT NULL,
  created_at      timestamptz DEFAULT now(),
  UNIQUE(source_card_id, target_card_id, field_key)
);

CREATE INDEX card_connections_source_idx ON card_connections(source_card_id);
CREATE INDEX card_connections_target_idx ON card_connections(target_card_id);

-- Card activity log
CREATE TABLE card_activities (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id     uuid NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  user_id     uuid REFERENCES auth.users(id),
  type        text NOT NULL,
  -- type: 'phase_move' | 'field_update' | 'card_created' | 'standby_on' | 'standby_off' | 'comment' | 'automation_fired'
  payload     jsonb DEFAULT '{}',
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX card_activities_card_id_idx ON card_activities(card_id, created_at DESC);

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cards_updated_at
  BEFORE UPDATE ON cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
