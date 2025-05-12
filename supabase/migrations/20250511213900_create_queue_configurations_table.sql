-- Create queue_configurations table
CREATE TABLE queue_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g., "Main Lobby Queue for License Renewals"
    welcome_message_template_id UUID REFERENCES message_templates(id) ON DELETE SET NULL,
    estimated_wait_time_logic TEXT, -- e.g., "average_service_time * position"
    is_active BOOLEAN DEFAULT TRUE,
    allow_new_appointments BOOLEAN DEFAULT TRUE, -- For 4.1.v
    max_future_booking_days INTEGER DEFAULT 30, -- For 4.1.g
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (location_id, service_id, name) -- A queue name should be unique for a given service at a location
);

-- Add comments to queue_configurations table and columns
COMMENT ON TABLE queue_configurations IS 'Stores configurations for specific queues, linking locations, services, and operational parameters.';
COMMENT ON COLUMN queue_configurations.id IS 'Unique identifier for the queue configuration.';
COMMENT ON COLUMN queue_configurations.location_id IS 'Foreign key linking to the location this queue configuration applies to. Can be NULL if it is a global template.';
COMMENT ON COLUMN queue_configurations.service_id IS 'Foreign key linking to the service this queue configuration applies to. Can be NULL if it is a global template.';
COMMENT ON COLUMN queue_configurations.name IS 'User-defined name for the queue (e.g., Main Lobby Queue).';
COMMENT ON COLUMN queue_configurations.welcome_message_template_id IS 'FK to message_templates for the welcome message of this queue.';
COMMENT ON COLUMN queue_configurations.estimated_wait_time_logic IS 'Stores logic or parameters for calculating estimated wait times.';
COMMENT ON COLUMN queue_configurations.is_active IS 'Indicates if this queue configuration is currently active.';
COMMENT ON COLUMN queue_configurations.allow_new_appointments IS 'Controls whether new appointments can be made for this queue (Req 4.1.v).';
COMMENT ON COLUMN queue_configurations.max_future_booking_days IS 'Maximum number of days in advance a booking can be made for this queue (Req 4.1.g).';
COMMENT ON COLUMN queue_configurations.created_at IS 'Timestamp of when the queue configuration was created.';
COMMENT ON COLUMN queue_configurations.updated_at IS 'Timestamp of when the queue configuration was last updated.';

