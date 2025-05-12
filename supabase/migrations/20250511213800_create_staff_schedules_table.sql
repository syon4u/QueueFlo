-- Create staff_schedules table
CREATE TABLE staff_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, -- Assuming 'profiles' is the users table
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'working', -- e.g., working, break, unavailable (for 4.1.z)
    assigned_service_id UUID REFERENCES services(id) ON DELETE SET NULL, -- For 4.1.r, 4.1.t
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT check_start_end_times CHECK (end_time > start_time)
);

-- Add comments to staff_schedules table and columns
COMMENT ON TABLE staff_schedules IS 'Stores staff working schedules, breaks, and service assignments.';
COMMENT ON COLUMN staff_schedules.id IS 'Unique identifier for the schedule entry.';
COMMENT ON COLUMN staff_schedules.staff_id IS 'Foreign key referencing the staff member (from profiles/users table).';
COMMENT ON COLUMN staff_schedules.location_id IS 'Foreign key referencing the location for this schedule entry.';
COMMENT ON COLUMN staff_schedules.start_time IS 'Start time of the staff member''s shift or specific block.';
COMMENT ON COLUMN staff_schedules.end_time IS 'End time of the staff member''s shift or specific block.';
COMMENT ON COLUMN staff_schedules.status IS 'Current status of the staff member during this scheduled block (e.g., working, break).';
COMMENT ON COLUMN staff_schedules.assigned_service_id IS 'Specific service the staff member is assigned to during this block, if applicable.';
COMMENT ON COLUMN staff_schedules.created_at IS 'Timestamp of when the schedule entry was created.';
COMMENT ON COLUMN staff_schedules.updated_at IS 'Timestamp of when the schedule entry was last updated.';

