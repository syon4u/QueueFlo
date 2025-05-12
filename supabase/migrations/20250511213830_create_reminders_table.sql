-- Create reminders table
CREATE TABLE reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    reminder_type TEXT NOT NULL, -- e.g., email, sms
    send_at TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'pending', -- e.g., pending, sent, failed
    message_template_id UUID REFERENCES message_templates(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comments to reminders table and columns
COMMENT ON TABLE reminders IS 'Stores information about scheduled appointment reminders.';
COMMENT ON COLUMN reminders.id IS 'Unique identifier for the reminder.';
COMMENT ON COLUMN reminders.appointment_id IS 'Foreign key linking to the appointment for which this reminder is scheduled.';
COMMENT ON COLUMN reminders.reminder_type IS 'Type of reminder (e.g., email, sms).';
COMMENT ON COLUMN reminders.send_at IS 'Timestamp indicating when the reminder should be sent.';
COMMENT ON COLUMN reminders.status IS 'Status of the reminder (e.g., pending, sent, failed).';
COMMENT ON COLUMN reminders.message_template_id IS 'Foreign key linking to the message template to be used for this reminder, if applicable.';
COMMENT ON COLUMN reminders.created_at IS 'Timestamp of when the reminder was created.';
COMMENT ON COLUMN reminders.updated_at IS 'Timestamp of when the reminder was last updated.';

