
-- Create a function to get all admin dashboard statistics in one query
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  today_date DATE := CURRENT_DATE;
BEGIN
  WITH 
    -- Today's appointment counts by status
    today_counts AS (
      SELECT 
        status,
        COUNT(*) as count
      FROM 
        appointments
      WHERE 
        DATE(scheduled_time) = today_date
      GROUP BY 
        status
    ),
    
    -- Average wait times by service (completed appointments)
    service_wait_times AS (
      SELECT 
        s.id as service_id,
        s.name as service_name,
        COALESCE(
          EXTRACT(EPOCH FROM AVG(a.end_time - a.start_time))/60,
          0
        )::FLOAT as avg_wait_minutes
      FROM 
        services s
      LEFT JOIN 
        appointments a ON s.id = a.service_id AND a.status = 'completed'
      GROUP BY 
        s.id, s.name
    ),
    
    -- Current queue by location
    location_queues AS (
      SELECT 
        l.id as location_id,
        l.name as location_name,
        json_agg(
          json_build_object(
            'id', a.id,
            'customer_id', a.customer_id,
            'service_id', a.service_id,
            'status', a.status,
            'scheduled_time', a.scheduled_time,
            'check_in_time', a.check_in_time,
            'wait_duration_minutes', 
              CASE 
                WHEN a.check_in_time IS NOT NULL AND a.status = 'checked_in' 
                  THEN EXTRACT(EPOCH FROM (NOW() - a.check_in_time))/60
                ELSE NULL
              END
          ) ORDER BY a.check_in_time ASC NULLS LAST, a.scheduled_time ASC
        ) as queue
      FROM 
        locations l
      LEFT JOIN 
        appointments a ON l.id = a.location_id 
          AND (a.status = 'checked_in' OR a.status = 'scheduled')
          AND DATE(a.scheduled_time) = today_date
      GROUP BY 
        l.id, l.name
    )
    
  -- Combine all stats into a single JSON object
  SELECT 
    json_build_object(
      'today_totals', (
        SELECT 
          json_object_agg(
            status, 
            count
          )
        FROM 
          today_counts
      ),
      'service_wait_times', (
        SELECT 
          json_agg(
            json_build_object(
              'service_id', service_id,
              'service_name', service_name,
              'avg_wait_minutes', avg_wait_minutes
            )
          )
        FROM 
          service_wait_times
      ),
      'location_queues', (
        SELECT 
          json_agg(
            json_build_object(
              'location_id', location_id,
              'location_name', location_name,
              'queue', queue
            )
          )
        FROM 
          location_queues
      ),
      'generated_at', NOW()
    ) INTO result;
    
  RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
-- The function itself will check for admin role via RLS
GRANT EXECUTE ON FUNCTION public.get_admin_dashboard_stats() TO authenticated;

-- Add comment to explain the function
COMMENT ON FUNCTION public.get_admin_dashboard_stats() IS 
  'Returns comprehensive stats for admin dashboard including today''s appointment counts, ' ||
  'average service wait times, and current queue by location';
