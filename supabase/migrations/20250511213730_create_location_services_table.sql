-- Create location_services junction table
CREATE TABLE location_services (
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    is_offered BOOLEAN DEFAULT TRUE,
    specific_operating_hours JSONB, -- Overrides location.operating_hours if needed for this service at this location
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (location_id, service_id)
);

-- Add comments to location_services table and columns
COMMENT ON TABLE location_services IS 'Junction table to link services to locations, defining which services are offered where.';
COMMENT ON COLUMN location_services.location_id IS 'Foreign key referencing the locations table.';
COMMENT ON COLUMN location_services.service_id IS 'Foreign key referencing the services table.';
COMMENT ON COLUMN location_services.is_offered IS 'Indicates if this service is currently offered at this location.';
COMMENT ON COLUMN location_services.specific_operating_hours IS 'JSONB object for service-specific operating hours at this location, overriding general location hours if provided.';
COMMENT ON COLUMN location_services.created_at IS 'Timestamp of when the service was linked to the location.';
COMMENT ON COLUMN location_services.updated_at IS 'Timestamp of when the link was last updated.';

