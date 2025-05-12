-- Create surveys table
CREATE TABLE surveys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Assuming profiles is the users table
    rating INTEGER,
    comments TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT check_rating CHECK (rating >= 1 AND rating <= 5) -- Assuming a 1-5 rating scale
);

-- Add comments to surveys table and columns
COMMENT ON TABLE surveys IS 'Stores customer feedback and survey responses related to appointments.';
COMMENT ON COLUMN surveys.id IS 'Unique identifier for the survey response.';
COMMENT ON COLUMN surveys.appointment_id IS 'Foreign key linking to the appointment for which this survey was conducted.';
COMMENT ON COLUMN surveys.customer_id IS 'Foreign key linking to the customer who submitted the survey.';
COMMENT ON COLUMN surveys.rating IS 'Numerical rating provided by the customer (e.g., 1-5).';
COMMENT ON COLUMN surveys.comments IS 'Textual comments or feedback from the customer.';
COMMENT ON COLUMN surveys.submitted_at IS 'Timestamp of when the survey was submitted by the customer.';
COMMENT ON COLUMN surveys.created_at IS 'Timestamp of when the survey record was created.';
COMMENT ON COLUMN surveys.updated_at IS 'Timestamp of when the survey record was last updated.';

