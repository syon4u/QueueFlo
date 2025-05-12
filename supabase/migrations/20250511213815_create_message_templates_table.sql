-- Create message_templates table
CREATE TABLE message_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    content_english TEXT,
    content_spanish TEXT,
    content_haitian_creole TEXT,
    content_portuguese TEXT,
    type TEXT, -- e.g., reminder, notification, survey_invite
    is_staff_customizable BOOLEAN DEFAULT TRUE, -- For 3.1.3, 3.1.6
    character_limit_ok BOOLEAN, -- For 4.1.m
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comments to message_templates table and columns
COMMENT ON TABLE message_templates IS 'Stores templates for various communications (reminders, notifications, etc.) with multilingual support.';
COMMENT ON COLUMN message_templates.id IS 'Unique identifier for the message template.';
COMMENT ON COLUMN message_templates.name IS 'Unique name for the template (e.g., appointment_confirmation_email, turn_approaching_sms).';
COMMENT ON COLUMN message_templates.content_english IS 'Template content in English.';
COMMENT ON COLUMN message_templates.content_spanish IS 'Template content in Spanish.';
COMMENT ON COLUMN message_templates.content_haitian_creole IS 'Template content in Haitian Creole.';
COMMENT ON COLUMN message_templates.content_portuguese IS 'Template content in Portuguese.';
COMMENT ON COLUMN message_templates.type IS 'Type of message (e.g., reminder, notification, survey_invite, queue_update).';
COMMENT ON COLUMN message_templates.is_staff_customizable IS 'Indicates if staff can customize this template (as per req 3.1.3).';
COMMENT ON COLUMN message_templates.character_limit_ok IS 'Indicates if the template content respects character limits (relevant for SMS, req 4.1.m).';
COMMENT ON COLUMN message_templates.created_at IS 'Timestamp of when the template was created.';
COMMENT ON COLUMN message_templates.updated_at IS 'Timestamp of when the template was last updated.';

