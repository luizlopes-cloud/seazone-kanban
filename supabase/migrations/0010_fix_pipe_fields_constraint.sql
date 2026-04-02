-- pipefy_id is not globally unique — same field key exists across pipes
-- Change constraint to (pipe_id, pipefy_id)
ALTER TABLE pipe_fields DROP CONSTRAINT IF EXISTS pipe_fields_pipefy_id_key;
ALTER TABLE pipe_fields DROP CONSTRAINT IF EXISTS pipe_fields_pipe_id_pipefy_id_key;
ALTER TABLE pipe_fields ADD CONSTRAINT pipe_fields_pipe_id_pipefy_id_key UNIQUE (pipe_id, pipefy_id);
