-- ============================================================
-- SEAZONE KANBAN — 20 CRITICAL AUTOMATION RULES
-- ============================================================

-- Helper: get phase ID by pipe_id + is_standby
-- We use subqueries to reference phases seeded in 0004

-- Rule 1: PIPE 0 card created → create card in PIPE 1 Implantação
INSERT INTO automation_rules (pipe_id, name, trigger_type, trigger_config, action_type, action_config) VALUES
(
  '00000000-0000-0000-0000-000000000001',
  'Onboarding → cria card Implantação',
  'card_created',
  '{}',
  'create_card',
  '{
    "target_pipe_id": "00000000-0000-0000-0000-000000000002",
    "copy_fields": ["codigo_imovel","nome_proprietario","telefone","email","cidade"],
    "connect_source_field": "onboarding_link",
    "connect_target_field": "implantacao_link"
  }'
),

-- Rule 2: PIPE 3 vistoria_realizada = Sim → create card in PIPE 2 Adequação
(
  '00000000-0000-0000-0000-000000000004',
  'Vistoria realizada → cria card Adequação',
  'field_updated',
  '{"field_key": "vistoria_realizada", "field_value": "Sim"}',
  'create_card',
  '{
    "target_pipe_id": "00000000-0000-0000-0000-000000000003",
    "copy_fields": ["codigo_imovel","nome_proprietario","implantacao_link"],
    "connect_target_field": "implantacao_link"
  }'
),

-- Rule 3: PIPE 4 fotos_aprovadas = Não → create redo card in PIPE 4
(
  '00000000-0000-0000-0000-000000000005',
  'Fotos reprovadas → cria card Refazer',
  'field_updated',
  '{"field_key": "fotos_aprovadas", "field_value": "Não"}',
  'create_card',
  '{
    "target_pipe_id": "00000000-0000-0000-0000-000000000005",
    "copy_fields": ["codigo_imovel","nome_proprietario","implantacao_link"],
    "title_prefix": "[REFAZER] ",
    "connect_target_field": "implantacao_link"
  }'
),

-- Rules 4-11: StandBy ON/OFF for each pipe (using is_standby flag on phases)
-- PIPE 0 StandBy ON
(
  '00000000-0000-0000-0000-000000000001',
  'PIPE 0 — Tag Standby ON',
  'card_moved',
  '{"to_is_standby": true}',
  'standby_on',
  '{"fill_date_field": "data_de_vencimento_do_prazo_de_stand_by"}'
),
-- PIPE 0 StandBy OFF
(
  '00000000-0000-0000-0000-000000000001',
  'PIPE 0 — Tag Standby OFF',
  'card_moved',
  '{"from_is_standby": true}',
  'standby_off',
  '{}'
),
-- PIPE 1 StandBy ON
(
  '00000000-0000-0000-0000-000000000002',
  'PIPE 1 — Tag Standby ON',
  'card_moved',
  '{"to_is_standby": true}',
  'standby_on',
  '{"fill_date_field": "data_de_vencimento_do_prazo_de_stand_by"}'
),
-- PIPE 1 StandBy OFF
(
  '00000000-0000-0000-0000-000000000002',
  'PIPE 1 — Tag Standby OFF',
  'card_moved',
  '{"from_is_standby": true}',
  'standby_off',
  '{}'
),
-- PIPE 3 StandBy ON
(
  '00000000-0000-0000-0000-000000000004',
  'PIPE 3 — Tag Standby ON',
  'card_moved',
  '{"to_is_standby": true}',
  'standby_on',
  '{"fill_date_field": "data_de_vencimento_do_prazo_de_stand_by"}'
),
-- PIPE 3 StandBy OFF
(
  '00000000-0000-0000-0000-000000000004',
  'PIPE 3 — Tag Standby OFF',
  'card_moved',
  '{"from_is_standby": true}',
  'standby_off',
  '{}'
),
-- PIPE 4 StandBy ON
(
  '00000000-0000-0000-0000-000000000005',
  'PIPE 4 — Tag Standby ON',
  'card_moved',
  '{"to_is_standby": true}',
  'standby_on',
  '{"fill_date_field": "data_de_vencimento_do_prazo_de_stand_by"}'
),
-- PIPE 4 StandBy OFF
(
  '00000000-0000-0000-0000-000000000005',
  'PIPE 4 — Tag Standby OFF',
  'card_moved',
  '{"from_is_standby": true}',
  'standby_off',
  '{}'
),

-- Rule 12: Auto-fill data_entrada on card_created (all pipes)
-- One rule per pipe because trigger_type filters by pipe_id
(
  '00000000-0000-0000-0000-000000000001',
  'PIPE 0 — Auto-fill data_entrada',
  'card_created',
  '{}',
  'fill_field',
  '{"field_key": "data_entrada", "value_from": "now"}'
),
(
  '00000000-0000-0000-0000-000000000002',
  'PIPE 1 — Auto-fill data_entrada',
  'card_created',
  '{}',
  'fill_field',
  '{"field_key": "data_entrada", "value_from": "now"}'
),
(
  '00000000-0000-0000-0000-000000000003',
  'PIPE 2 — Auto-fill data_entrada',
  'card_created',
  '{}',
  'fill_field',
  '{"field_key": "data_entrada", "value_from": "now"}'
),
(
  '00000000-0000-0000-0000-000000000004',
  'PIPE 3 — Auto-fill data_entrada',
  'card_created',
  '{}',
  'fill_field',
  '{"field_key": "data_entrada", "value_from": "now"}'
),

-- Rule 13-17: card_done in each pipe → update status in PIPE 1 card
(
  '00000000-0000-0000-0000-000000000003',
  'PIPE 2 done → update Adequação status in PIPE 1',
  'card_done',
  '{}',
  'fill_field',
  '{"field_key": "adequacao_status", "value": "Concluída", "target": "connected_card", "target_field": "implantacao_link", "target_pipe_id": "00000000-0000-0000-0000-000000000002"}'
),
(
  '00000000-0000-0000-0000-000000000004',
  'PIPE 3 done → update Vistoria status in PIPE 1',
  'card_done',
  '{}',
  'fill_field',
  '{"field_key": "vistoria_status", "value": "Concluída", "target": "connected_card", "target_field": "implantacao_link", "target_pipe_id": "00000000-0000-0000-0000-000000000002"}'
),
(
  '00000000-0000-0000-0000-000000000005',
  'PIPE 4 done → update Fotos status in PIPE 1',
  'card_done',
  '{}',
  'fill_field',
  '{"field_key": "fotos_status", "value": "Aprovadas", "target": "connected_card", "target_field": "implantacao_link", "target_pipe_id": "00000000-0000-0000-0000-000000000002"}'
),
(
  '00000000-0000-0000-0000-000000000006',
  'PIPE 5 done → update Anúncio status in PIPE 1',
  'card_done',
  '{}',
  'fill_field',
  '{"field_key": "anuncio_status", "value": "Publicado", "target": "connected_card", "target_field": "implantacao_link", "target_pipe_id": "00000000-0000-0000-0000-000000000002"}'
);

-- ---- WEBHOOK ENDPOINTS (Make.com - forward all events) ----
-- These are placeholder URLs — real Make.com webhook URLs should be added via admin UI
-- The outbound webhook engine reads from this table

INSERT INTO webhook_endpoints (pipe_id, url, events, description) VALUES
  (NULL, 'https://hook.us1.make.com/placeholder-all-pipes', ARRAY['card_created','card_moved','card_field_updated','card_done'], 'Make.com — Todos os pipes (substituir com URL real)');
