-- Modify appointments table to include new fields and foreign keys
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS service_id UUID REFERENCES services(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS staff_id_assigned UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Assuming 'profiles' is the users table
ADD COLUMN IF NOT EXISTS check_in_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS service_start_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS service_end_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS customer_notes TEXT,
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
ADD COLUMN IF NOT EXISTS reschedule_original_appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL;

-- It's safer to add a new status column than to modify an existing one if its type is restrictive (e.g. enum without these new values)
-- For this example, let's assume we are adding a new text-based status column or that the existing one can accommodate these values.
-- If 'status' column already exists and is an enum, this might require dropping and recreating the enum type with new values, or altering the enum type if supported.
-- For simplicity, we'll assume it's a TEXT column or can be altered.
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS status_new TEXT; -- Example: 'scheduled', 'checked_in', 'servicing', 'completed', 'cancelled', 'no_show'

-- Add comments for new/modified columns in appointments table
COMMENT ON COLUMN appointments.location_id IS 'Foreign key linking to the location where the appointment is scheduled.';
COMMENT ON COLUMN appointments.service_id IS 'Foreign key linking to the service for this appointment.';
COMMENT ON COLUMN appointments.staff_id_assigned IS 'Foreign key linking to the staff member assigned to this appointment (from profiles/users table).';
COMMENT ON COLUMN appointments.check_in_time IS 'Timestamp of when the customer checked in for their appointment.';
COMMENT ON COLUMN appointments.service_start_time IS 'Timestamp of when the service for the appointment began.';
COMMENT ON COLUMN appointments.service_end_time IS 'Timestamp of when the service for the appointment ended.';
COMMENT ON COLUMN appointments.customer_notes IS 'Additional notes provided by the customer regarding the appointment (e.g., reason for visit, case number).';
COMMENT ON COLUMN appointments.cancellation_reason IS 'Reason for appointment cancellation, if applicable.';
COMMENT ON COLUMN appointments.reschedule_original_appointment_id IS 'If this appointment is a reschedule, this links to the original appointment ID.';
COMMENT ON COLUMN appointments.status_new IS 'Current status of the appointment (e.g., scheduled, checked_in, servicing, completed, cancelled, no_show). Replacing original status if it was too restrictive.';

-- Note: If the original 'status' column needs to be replaced by 'status_new' due to type constraints (e.g. old enum):
-- 1. Data migration would be needed: UPDATE appointments SET status_new = status::TEXT;
-- 2. Then drop old status: ALTER TABLE appointments DROP COLUMN status;
-- 3. Then rename new status: ALTER TABLE appointments RENAME COLUMN status_new TO status;
-- This script assumes 'status_new' is added, and manual steps would follow for full replacement if needed.

