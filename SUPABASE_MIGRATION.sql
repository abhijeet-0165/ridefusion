-- Optional Migration: Add monthly pass tracking to bookings table
-- Run this in your Supabase SQL Editor if you want to track which pass was used for each booking

-- Add usedPass column to bookings table (optional - for tracking pass usage)
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS usedPass TEXT;

-- Add comment to explain the column
COMMENT ON COLUMN bookings.usedPass IS 'ID of the monthly pass used for this booking (if any)';

-- Note: Monthly passes themselves are stored in localStorage, not in the database.
-- This column is only for tracking which pass was used when booking a ride.

