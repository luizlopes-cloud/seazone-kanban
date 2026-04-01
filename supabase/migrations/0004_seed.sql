-- ============================================================
-- SEAZONE KANBAN — SEED DATA (Pipes, Phases, Fields)
-- Fixed UUIDs for pipes so other migrations can reference them
-- ============================================================

-- ---- PIPES ----
INSERT INTO pipes (id, pipefy_id, name, slug, position, color) VALUES
  ('00000000-0000-0000-0000-000000000001', 303807224, 'PIPE 0 - Onboarding proprietário', 'onboarding',  0, '#3B82F6'),
  ('00000000-0000-0000-0000-000000000002', 303781436, 'PIPE 1 - Implantação/Mãe',         'implantacao', 1, '#8B5CF6'),
  ('00000000-0000-0000-0000-000000000003', 303828424, 'PIPE 2 - Adequação',               'adequacao',   2, '#F59E0B'),
  ('00000000-0000-0000-0000-000000000004', 302290867, 'PIPE 3 - Vistorias',               'vistorias',   3, '#10B981'),
  ('00000000-0000-0000-0000-000000000005', 302290880, 'PIPE 4 - Fotos Profissionais',     'fotos',       4, '#EC4899'),
  ('00000000-0000-0000-0000-000000000006', 303024105, 'PIPE 5 - Criação de Anúncios',     'anuncios',    5, '#F97316');

-- ---- PHASES — PIPE 0 (14 phases) ----
INSERT INTO phases (pipe_id, pipefy_id, name, position, is_standby, is_done) VALUES
  ('00000000-0000-0000-0000-000000000001', 323192886, 'Backlog',                           0,  false, false),
  ('00000000-0000-0000-0000-000000000001', 326998147, 'StandBy/Construção/Reforma',        1,  true,  false),
  ('00000000-0000-0000-0000-000000000001', 323192887, 'Primeiro contato',                  2,  false, false),
  ('00000000-0000-0000-0000-000000000001', 323290601, 'Vistoria + Franquia',               3,  false, false),
  ('00000000-0000-0000-0000-000000000001', 323192888, 'Videochamada',                      4,  false, false),
  ('00000000-0000-0000-0000-000000000001', 333705823, 'Pedido Enxoval',                    5,  false, false),
  ('00000000-0000-0000-0000-000000000001', 333706135, 'Perguntas Setup',                   6,  false, false),
  ('00000000-0000-0000-0000-000000000001', 323543301, 'Acompanhamento Adequação',          7,  false, false),
  ('00000000-0000-0000-0000-000000000001', 323192900, 'Aviso Ativação',                    8,  false, false),
  ('00000000-0000-0000-0000-000000000001', 323192905, 'Finalizado',                        9,  false, true),
  ('00000000-0000-0000-0000-000000000001', 323665911, 'Churn solicitado',                  10, false, false),
  ('00000000-0000-0000-0000-000000000001', 338531443, 'Reversão Churn',                    11, false, false),
  ('00000000-0000-0000-0000-000000000001', 323634845, 'Churn finalizado',                  12, false, true),
  ('00000000-0000-0000-0000-000000000001', 329664298, 'Excluídos',                         13, false, true);

-- ---- PHASES — PIPE 1 (16 phases) ----
INSERT INTO phases (pipe_id, pipefy_id, name, position, is_standby, is_done) VALUES
  ('00000000-0000-0000-0000-000000000002', 323044780, 'Backlog',                           0,  false, false),
  ('00000000-0000-0000-0000-000000000002', 333371452, 'StandBy/Reforma/Construção',        1,  true,  false),
  ('00000000-0000-0000-0000-000000000002', 323044781, 'Contato Franquia',                  2,  false, false),
  ('00000000-0000-0000-0000-000000000002', 323044783, 'Setup Interno',                     3,  false, false),
  ('00000000-0000-0000-0000-000000000002', 323044784, 'Vistoria Inicial',                  4,  false, false),
  ('00000000-0000-0000-0000-000000000002', 323044785, 'Config Imóvel',                     5,  false, false),
  ('00000000-0000-0000-0000-000000000002', 323044786, 'Adequação/Enxoval',                 6,  false, false),
  ('00000000-0000-0000-0000-000000000002', 323044787, 'Fotos',                             7,  false, false),
  ('00000000-0000-0000-0000-000000000002', 323044789, 'Revisão/Limpeza',                   8,  false, false),
  ('00000000-0000-0000-0000-000000000002', 323044790, 'Ativação Anúncio',                  9,  false, false),
  ('00000000-0000-0000-0000-000000000002', 323044791, 'Pendências + Vistoria SAPRON',      10, false, false),
  ('00000000-0000-0000-0000-000000000002', 323044792, 'Ativação OTA',                      11, false, false),
  ('00000000-0000-0000-0000-000000000002', 323044793, 'Pós-Ativação',                      12, false, false),
  ('00000000-0000-0000-0000-000000000002', 323044794, 'Finalizado',                        13, false, true),
  ('00000000-0000-0000-0000-000000000002', 323044795, 'Churn',                             14, false, false),
  ('00000000-0000-0000-0000-000000000002', 329664296, 'Excluídos',                         15, false, true);

-- ---- PHASES — PIPE 2 (9 phases) ----
INSERT INTO phases (pipe_id, pipefy_id, name, position, is_standby, is_done) VALUES
  ('00000000-0000-0000-0000-000000000003', 323529355, 'Caixa de Entrada',                  0,  false, false),
  ('00000000-0000-0000-0000-000000000003', 323315791, 'Relatórios/Comunicação',            1,  false, false),
  ('00000000-0000-0000-0000-000000000003', 323315794, 'Liberados Revisão/Criação',         2,  false, false),
  ('00000000-0000-0000-0000-000000000003', 323315801, 'Em andamento',                      3,  false, false),
  ('00000000-0000-0000-0000-000000000003', 323315809, 'Aguardando aprovação',              4,  false, false),
  ('00000000-0000-0000-0000-000000000003', 323653640, 'Finalizado',                        5,  false, true),
  ('00000000-0000-0000-0000-000000000003', 323634844, 'Stand-By',                          6,  true,  false),
  ('00000000-0000-0000-0000-000000000003', 323634843, 'Churn',                             7,  false, false),
  ('00000000-0000-0000-0000-000000000003', 329664297, 'Excluídos',                         8,  false, true);

-- ---- PHASES — PIPE 3 (8 phases) ----
INSERT INTO phases (pipe_id, pipefy_id, name, position, is_standby, is_done) VALUES
  ('00000000-0000-0000-0000-000000000004', 314555399, 'Início',                            0,  false, false),
  ('00000000-0000-0000-0000-000000000004', 342089030, 'Stand-by',                          1,  true,  false),
  ('00000000-0000-0000-0000-000000000004', 323436097, 'Agendamento',                       2,  false, false),
  ('00000000-0000-0000-0000-000000000004', 323047497, 'Agendada',                          3,  false, false),
  ('00000000-0000-0000-0000-000000000004', 323047498, 'Realizada',                         4,  false, false),
  ('00000000-0000-0000-0000-000000000004', 323047500, 'Análise',                           5,  false, false),
  ('00000000-0000-0000-0000-000000000004', 323047501, 'Finalizado',                        6,  false, true),
  ('00000000-0000-0000-0000-000000000004', 329664293, 'Excluídos',                         7,  false, true);

-- ---- PHASES — PIPE 4 (14 phases) ----
INSERT INTO phases (pipe_id, pipefy_id, name, position, is_standby, is_done) VALUES
  ('00000000-0000-0000-0000-000000000005', 314555468, 'Início',                            0,  false, false),
  ('00000000-0000-0000-0000-000000000005', 334016330, 'Contato Franquia',                  1,  false, false),
  ('00000000-0000-0000-0000-000000000005', 342039065, 'Imóveis Ativos',                    2,  false, false),
  ('00000000-0000-0000-0000-000000000005', 323345420, 'Contato Fotógrafo',                 3,  false, false),
  ('00000000-0000-0000-0000-000000000005', 317201451, 'Agendadas',                         4,  false, false),
  ('00000000-0000-0000-0000-000000000005', 314555469, 'Realizadas',                        5,  false, false),
  ('00000000-0000-0000-0000-000000000005', 326997903, 'Análise Fotos',                     6,  false, false),
  ('00000000-0000-0000-0000-000000000005', 328814723, 'Seleção Fotos',                     7,  false, false),
  ('00000000-0000-0000-0000-000000000005', 326997879, 'Conferência Anúncios',              8,  false, false),
  ('00000000-0000-0000-0000-000000000005', 314591807, 'Finalizadas',                       9,  false, true),
  ('00000000-0000-0000-0000-000000000005', 328441738, 'Churn',                             10, false, false),
  ('00000000-0000-0000-0000-000000000005', 329664289, 'Excluídos',                         11, false, true),
  ('00000000-0000-0000-0000-000000000005', 341253818, 'StandBy',                           12, true,  false),
  ('00000000-0000-0000-0000-000000000005', 341253806, 'Refazer Fotos',                     13, false, false);

-- ---- PHASES — PIPE 5 (13 phases) ----
INSERT INTO phases (pipe_id, pipefy_id, name, position, is_standby, is_done) VALUES
  ('00000000-0000-0000-0000-000000000006', NULL, 'Backlog',                                0,  false, false),
  ('00000000-0000-0000-0000-000000000006', NULL, 'StandBy',                                1,  true,  false),
  ('00000000-0000-0000-0000-000000000006', NULL, 'Criação Stays',                          2,  false, false),
  ('00000000-0000-0000-0000-000000000006', NULL, 'Criação OTAs',                           3,  false, false),
  ('00000000-0000-0000-0000-000000000006', NULL, 'Aguardando Implantação',                 4,  false, false),
  ('00000000-0000-0000-0000-000000000006', NULL, 'Ativação',                               5,  false, false),
  ('00000000-0000-0000-0000-000000000006', NULL, 'Revisão Final',                          6,  false, false),
  ('00000000-0000-0000-0000-000000000006', NULL, 'Finalizado',                             7,  false, true),
  ('00000000-0000-0000-0000-000000000006', NULL, 'Churn',                                  8,  false, false),
  ('00000000-0000-0000-0000-000000000006', NULL, 'Excluídos',                              9,  false, true),
  ('00000000-0000-0000-0000-000000000006', NULL, 'Pendências',                             10, false, false),
  ('00000000-0000-0000-0000-000000000006', NULL, 'Publicação Parcial',                     11, false, false),
  ('00000000-0000-0000-0000-000000000006', NULL, 'Aguardando revisão',                     12, false, false);

-- ---- CORE FIELDS (shared across pipes) ----

-- PIPE 0 fields
INSERT INTO pipe_fields (pipe_id, pipefy_id, label, key, type, options, position) VALUES
  ('00000000-0000-0000-0000-000000000001', 'p0_codigo_imovel',       'Código do Imóvel',         'codigo_imovel',           'short_text',      NULL, 0),
  ('00000000-0000-0000-0000-000000000001', 'p0_nome_proprietario',   'Nome do Proprietário',     'nome_proprietario',       'short_text',      NULL, 1),
  ('00000000-0000-0000-0000-000000000001', 'p0_telefone',            'Telefone',                 'telefone',                'short_text',      NULL, 2),
  ('00000000-0000-0000-0000-000000000001', 'p0_email',               'E-mail',                   'email',                   'short_text',      NULL, 3),
  ('00000000-0000-0000-0000-000000000001', 'p0_cidade',              'Cidade',                   'cidade',                  'select',          '["Florianópolis","São Paulo","Salvador","Rio de Janeiro","Curitiba","Outros"]', 4),
  ('00000000-0000-0000-0000-000000000001', 'p0_reuniao_agendada',    'Reunião agendada?',        'reuniao_agendada',        'radio_vertical',  '[{"label":"Sim","value":"Sim"},{"label":"Não","value":"Não"}]', 5),
  ('00000000-0000-0000-0000-000000000001', 'p0_data_videochamada',   'Data da Videochamada',     'data_videochamada',       'datetime',        NULL, 6),
  ('00000000-0000-0000-0000-000000000001', 'p0_mensagem_enviada',    'Mensagem enviada?',        'mensagem_enviada',        'radio_vertical',  '[{"label":"Sim","value":"Sim"},{"label":"Não","value":"Não"}]', 7),
  ('00000000-0000-0000-0000-000000000001', 'p0_link_implantacao',    'Implantação (PIPE 1)',     'implantacao_link',        'connector',       NULL, 8),
  ('00000000-0000-0000-0000-000000000001', 'p0_data_entrada',        'Data de entrada',          'data_entrada',            'datetime',        NULL, 9),
  ('00000000-0000-0000-0000-000000000001', 'p0_observacoes',         'Observações',              'observacoes',             'long_text',       NULL, 10),
  ('00000000-0000-0000-0000-000000000001', 'p0_standby_prazo',       'Prazo Stand-By',           'data_de_vencimento_do_prazo_de_stand_by', 'due_date', NULL, 11),
  ('00000000-0000-0000-0000-000000000001', 'p0_churn_motivo',        'Motivo do Churn',          'motivo_churn',            'select',          '["Desistência","Concorrência","Insatisfação","Preço","Outros"]', 12),
  ('00000000-0000-0000-0000-000000000001', 'p0_churn_reversivel',    'Churn reversível?',        'churn_reversivel',        'radio_vertical',  '[{"label":"Sim","value":"Sim"},{"label":"Não","value":"Não"}]', 13);

-- PIPE 1 fields (central hub — most fields)
INSERT INTO pipe_fields (pipe_id, pipefy_id, label, key, type, options, position) VALUES
  ('00000000-0000-0000-0000-000000000002', 'p1_codigo_imovel',       'Código do Imóvel',         'codigo_imovel',           'short_text',      NULL, 0),
  ('00000000-0000-0000-0000-000000000002', 'p1_nome_proprietario',   'Nome do Proprietário',     'nome_proprietario',       'short_text',      NULL, 1),
  ('00000000-0000-0000-0000-000000000002', 'p1_telefone',            'Telefone',                 'telefone',                'short_text',      NULL, 2),
  ('00000000-0000-0000-0000-000000000002', 'p1_email',               'E-mail',                   'email',                   'short_text',      NULL, 3),
  ('00000000-0000-0000-0000-000000000002', 'p1_cidade',              'Cidade',                   'cidade',                  'select',          '["Florianópolis","São Paulo","Salvador","Rio de Janeiro","Curitiba","Outros"]', 4),
  ('00000000-0000-0000-0000-000000000002', 'p1_endereco',            'Endereço',                 'endereco',                'short_text',      NULL, 5),
  ('00000000-0000-0000-0000-000000000002', 'p1_link_onboarding',     'Onboarding (PIPE 0)',      'onboarding_link',         'connector',       NULL, 6),
  ('00000000-0000-0000-0000-000000000002', 'p1_adequacao_status',    'Status Adequação',         'adequacao_status',        'select',          '["Aguardando","Em andamento","Concluída","Cancelada"]', 7),
  ('00000000-0000-0000-0000-000000000002', 'p1_vistoria_status',     'Status Vistoria',          'vistoria_status',         'select',          '["Aguardando","Agendada","Concluída","Cancelada"]', 8),
  ('00000000-0000-0000-0000-000000000002', 'p1_fotos_status',        'Status Fotos',             'fotos_status',            'select',          '["Aguardando","Agendadas","Aprovadas","Reprovadas"]', 9),
  ('00000000-0000-0000-0000-000000000002', 'p1_anuncio_status',      'Status Anúncio',           'anuncio_status',          'select',          '["Aguardando","Em criação","Publicado","Reprovado"]', 10),
  ('00000000-0000-0000-0000-000000000002', 'p1_standby_prazo',       'Prazo Stand-By',           'data_de_vencimento_do_prazo_de_stand_by', 'due_date', NULL, 11),
  ('00000000-0000-0000-0000-000000000002', 'p1_data_ativacao',       'Data de Ativação',         'data_ativacao',           'date',            NULL, 12),
  ('00000000-0000-0000-0000-000000000002', 'p1_sapron_config',       'Config SAPRON realizada?', 'sapron_config',           'radio_vertical',  '[{"label":"Sim","value":"Sim"},{"label":"Não","value":"Não"}]', 13),
  ('00000000-0000-0000-0000-000000000002', 'p1_observacoes',         'Observações',              'observacoes',             'long_text',       NULL, 14),
  ('00000000-0000-0000-0000-000000000002', 'p1_data_entrada',        'Data de entrada',          'data_entrada',            'datetime',        NULL, 15);

-- PIPE 2 fields
INSERT INTO pipe_fields (pipe_id, pipefy_id, label, key, type, options, position) VALUES
  ('00000000-0000-0000-0000-000000000003', 'p2_codigo_imovel',       'Código do Imóvel',         'codigo_imovel',           'short_text',      NULL, 0),
  ('00000000-0000-0000-0000-000000000003', 'p2_nome_proprietario',   'Nome do Proprietário',     'nome_proprietario',       'short_text',      NULL, 1),
  ('00000000-0000-0000-0000-000000000003', 'p2_link_implantacao',    'Implantação (PIPE 1)',     'implantacao_link',        'connector',       NULL, 2),
  ('00000000-0000-0000-0000-000000000003', 'p2_tipo_adequacao',      'Tipo de Adequação',        'tipo_adequacao',          'select',          '["Móveis","Decoração","Reforma pequena","Reforma grande","Limpeza especial","Outros"]', 3),
  ('00000000-0000-0000-0000-000000000003', 'p2_itens_pendentes',     'Itens pendentes',          'itens_pendentes',         'checklist_vertical', NULL, 4),
  ('00000000-0000-0000-0000-000000000003', 'p2_adequacao_aceita',    'Adequação aceita?',        'adequacao_aceita',        'radio_vertical',  '[{"label":"Sim","value":"Sim"},{"label":"Não","value":"Não"}]', 5),
  ('00000000-0000-0000-0000-000000000003', 'p2_observacoes',         'Observações',              'observacoes',             'long_text',       NULL, 6),
  ('00000000-0000-0000-0000-000000000003', 'p2_data_entrada',        'Data de entrada',          'data_entrada',            'datetime',        NULL, 7);

-- PIPE 3 fields
INSERT INTO pipe_fields (pipe_id, pipefy_id, label, key, type, options, position) VALUES
  ('00000000-0000-0000-0000-000000000004', 'p3_codigo_imovel',       'Código do Imóvel',         'codigo_imovel',           'short_text',      NULL, 0),
  ('00000000-0000-0000-0000-000000000004', 'p3_nome_proprietario',   'Nome do Proprietário',     'nome_proprietario',       'short_text',      NULL, 1),
  ('00000000-0000-0000-0000-000000000004', 'p3_link_implantacao',    'Implantação (PIPE 1)',     'implantacao_link',        'connector',       NULL, 2),
  ('00000000-0000-0000-0000-000000000004', 'p3_tipo_vistoria',       'Tipo de Vistoria',         'tipo_vistoria',           'select',          '["Vistoria inicial","Vistoria SAPRON","Vistoria de qualidade","Vistoria de churn","Outros"]', 3),
  ('00000000-0000-0000-0000-000000000004', 'p3_data_agendamento',    'Data Agendada',            'data_agendamento',        'datetime',        NULL, 4),
  ('00000000-0000-0000-0000-000000000004', 'p3_vistoriador',         'Vistoriador',              'vistoriador',             'short_text',      NULL, 5),
  ('00000000-0000-0000-0000-000000000004', 'p3_vistoria_realizada',  'Vistoria realizada?',      'vistoria_realizada',      'radio_vertical',  '[{"label":"Sim","value":"Sim"},{"label":"Não","value":"Não"}]', 6),
  ('00000000-0000-0000-0000-000000000004', 'p3_resultado',           'Resultado',                'resultado',               'select',          '["Aprovado","Reprovado","Aprovado com pendências","Cancelado"]', 7),
  ('00000000-0000-0000-0000-000000000004', 'p3_observacoes',         'Observações',              'observacoes',             'long_text',       NULL, 8),
  ('00000000-0000-0000-0000-000000000004', 'p3_standby_prazo',       'Prazo Stand-By',           'data_de_vencimento_do_prazo_de_stand_by', 'due_date', NULL, 9),
  ('00000000-0000-0000-0000-000000000004', 'p3_data_entrada',        'Data de entrada',          'data_entrada',            'datetime',        NULL, 10);

-- PIPE 4 fields
INSERT INTO pipe_fields (pipe_id, pipefy_id, label, key, type, options, position) VALUES
  ('00000000-0000-0000-0000-000000000005', 'p4_codigo_imovel',       'Código do Imóvel',         'codigo_imovel',           'short_text',      NULL, 0),
  ('00000000-0000-0000-0000-000000000005', 'p4_nome_proprietario',   'Nome do Proprietário',     'nome_proprietario',       'short_text',      NULL, 1),
  ('00000000-0000-0000-0000-000000000005', 'p4_link_implantacao',    'Implantação (PIPE 1)',     'implantacao_link',        'connector',       NULL, 2),
  ('00000000-0000-0000-0000-000000000005', 'p4_fotografo',           'Fotógrafo',                'fotografo',               'short_text',      NULL, 3),
  ('00000000-0000-0000-0000-000000000005', 'p4_data_agendamento',    'Data Agendada',            'data_agendamento',        'datetime',        NULL, 4),
  ('00000000-0000-0000-0000-000000000005', 'p4_fotos_realizadas',    'Fotos realizadas?',        'fotos_realizadas',        'radio_vertical',  '[{"label":"Sim","value":"Sim"},{"label":"Não","value":"Não"}]', 5),
  ('00000000-0000-0000-0000-000000000005', 'p4_fotos_aprovadas',     'Fotos aprovadas?',         'fotos_aprovadas',         'radio_vertical',  '[{"label":"Sim","value":"Sim"},{"label":"Não","value":"Não"}]', 6),
  ('00000000-0000-0000-0000-000000000005', 'p4_link_fotos',          'Link das Fotos',           'link_fotos',              'short_text',      NULL, 7),
  ('00000000-0000-0000-0000-000000000005', 'p4_observacoes',         'Observações',              'observacoes',             'long_text',       NULL, 8),
  ('00000000-0000-0000-0000-000000000005', 'p4_standby_prazo',       'Prazo Stand-By',           'data_de_vencimento_do_prazo_de_stand_by', 'due_date', NULL, 9),
  ('00000000-0000-0000-0000-000000000005', 'p4_data_entrada',        'Data de entrada',          'data_entrada',            'datetime',        NULL, 10);

-- PIPE 5 fields
INSERT INTO pipe_fields (pipe_id, pipefy_id, label, key, type, options, position) VALUES
  ('00000000-0000-0000-0000-000000000006', 'p5_codigo_imovel',       'Código do Imóvel',         'codigo_imovel',           'short_text',      NULL, 0),
  ('00000000-0000-0000-0000-000000000006', 'p5_nome_proprietario',   'Nome do Proprietário',     'nome_proprietario',       'short_text',      NULL, 1),
  ('00000000-0000-0000-0000-000000000006', 'p5_link_implantacao',    'Implantação (PIPE 1)',     'implantacao_link',        'connector',       NULL, 2),
  ('00000000-0000-0000-0000-000000000006', 'p5_plataformas',         'Plataformas',              'plataformas',             'checklist_vertical', '["Stays","Booking.com","Airbnb","Expedia","Vrbo","Google","TripAdvisor"]', 3),
  ('00000000-0000-0000-0000-000000000006', 'p5_anuncio_criado',      'Anúncio criado?',          'anuncio_criado',          'radio_vertical',  '[{"label":"Sim","value":"Sim"},{"label":"Não","value":"Não"}]', 4),
  ('00000000-0000-0000-0000-000000000006', 'p5_link_anuncio_stays',  'Link Stays',               'link_anuncio_stays',      'short_text',      NULL, 5),
  ('00000000-0000-0000-0000-000000000006', 'p5_link_anuncio_booking','Link Booking',             'link_anuncio_booking',    'short_text',      NULL, 6),
  ('00000000-0000-0000-0000-000000000006', 'p5_link_anuncio_airbnb', 'Link Airbnb',              'link_anuncio_airbnb',     'short_text',      NULL, 7),
  ('00000000-0000-0000-0000-000000000006', 'p5_observacoes',         'Observações',              'observacoes',             'long_text',       NULL, 8),
  ('00000000-0000-0000-0000-000000000006', 'p5_data_entrada',        'Data de entrada',          'data_entrada',            'datetime',        NULL, 9);

-- ---- SET connector_pipe_id for connector fields ----
UPDATE pipe_fields SET connector_pipe_id = '00000000-0000-0000-0000-000000000002'
  WHERE key = 'implantacao_link';

UPDATE pipe_fields SET connector_pipe_id = '00000000-0000-0000-0000-000000000001'
  WHERE key = 'onboarding_link';
