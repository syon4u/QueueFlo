-- Create locations table
CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT,
    operating_hours JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comments to locations table and columns
COMMENT ON TABLE locations IS 'Stores information about different service locations.';
COMMENT ON COLUMN locations.id IS 'Unique identifier for the location.';
COMMENT ON COLUMN locations.name IS 'Name of the location (e.g., Main Office, Downtown Branch).';
COMMENT ON COLUMN locations.address IS 'Physical address of the location.';
COMMENT ON COLUMN locations.operating_hours IS 'JSONB object storing operating hours for each day (e.g., {"monday": {"open": "09:00", "close": "17:00"}}).';
COMMENT ON COLUMN locations.created_at IS 'Timestamp of when the location was created.';
COMMENT ON COLUMN locations.updated_at IS 'Timestamp of when the location was last updated.';

