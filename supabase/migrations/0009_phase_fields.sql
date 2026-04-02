-- Add phase_id to pipe_fields to associate fields with specific phases
-- NULL = start form field (always shown), non-NULL = shown only in that phase
ALTER TABLE pipe_fields ADD COLUMN IF NOT EXISTS phase_id UUID REFERENCES phases(id) ON DELETE SET NULL;
