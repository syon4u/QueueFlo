-- Create services table
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    default_duration_minutes INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    max_capacity_per_slot INTEGER DEFAULT 1, -- For features like 4.1.y (e.g. number of computer stations)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comments to services table and columns
COMMENT ON TABLE services IS 'Stores information about different services offered.';
COMMENT ON COLUMN services.id IS 'Unique identifier for the service.';
COMMENT ON COLUMN services.name IS 'Name of the service (e.g., License Renewal, New Application).';
COMMENT ON COLUMN services.description IS 'Detailed description of the service.';
COMMENT ON COLUMN services.default_duration_minutes IS 'Estimated default duration for the service in minutes.';
COMMENT ON COLUMN services.is_active IS 'Whether the service is currently offered.';
COMMENT ON COLUMN services.max_capacity_per_slot IS 'Maximum number of customers that can be served simultaneously for this service in a single time slot (e.g. number of available stations).';
COMMENT ON COLUMN services.created_at IS 'Timestamp of when the service was created.';
COMMENT ON COLUMN services.updated_at IS 'Timestamp of when the service was last updated.';

