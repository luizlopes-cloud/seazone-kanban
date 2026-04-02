-- Add "Validade" date field to all 6 pipes
INSERT INTO pipe_fields (pipe_id, pipefy_id, label, key, type, options, position) VALUES
  ('00000000-0000-0000-0000-000000000001', 'p0_validade', 'Validade', 'validade', 'date', NULL, 99),
  ('00000000-0000-0000-0000-000000000002', 'p1_validade', 'Validade', 'validade', 'date', NULL, 99),
  ('00000000-0000-0000-0000-000000000003', 'p2_validade', 'Validade', 'validade', 'date', NULL, 99),
  ('00000000-0000-0000-0000-000000000004', 'p3_validade', 'Validade', 'validade', 'date', NULL, 99),
  ('00000000-0000-0000-0000-000000000005', 'p4_validade', 'Validade', 'validade', 'date', NULL, 99),
  ('00000000-0000-0000-0000-000000000006', 'p5_validade', 'Validade', 'validade', 'date', NULL, 99);
