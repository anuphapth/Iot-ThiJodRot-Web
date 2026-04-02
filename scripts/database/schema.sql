-- Database schema for IoT Parking System
-- Run this script to create the database tables

-- Create parking_status table
CREATE TABLE IF NOT EXISTS parking_status (
    id SERIAL PRIMARY KEY,
    slot INTEGER NOT NULL UNIQUE,
    status INTEGER NOT NULL DEFAULT 0, -- 0: ว่าง, 1: มีรถ, 2: ซ่อมบำรุง
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create parking_logs table
CREATE TABLE IF NOT EXISTS parking_logs (
    id SERIAL PRIMARY KEY,
    slot INTEGER NOT NULL,
    time_in TIMESTAMP NOT NULL,
    time_out TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (slot) REFERENCES parking_status(slot)
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create power table
CREATE TABLE IF NOT EXISTS power (
    id SERIAL PRIMARY KEY,
    use DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_parking_logs_slot ON parking_logs(slot);
CREATE INDEX IF NOT EXISTS idx_parking_logs_time_in ON parking_logs(time_in);
CREATE INDEX IF NOT EXISTS idx_parking_logs_time_out ON parking_logs(time_out);
CREATE INDEX IF NOT EXISTS idx_power_created_at ON power(created_at);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Create trigger to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to tables that have updated_at
CREATE TRIGGER update_parking_status_updated_at 
    BEFORE UPDATE ON parking_status 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial data
INSERT INTO parking_status (slot, status) VALUES 
(1, 0), 
(2, 0) 
ON CONFLICT (slot) DO NOTHING;

-- Create default admin user (password: admin123)
-- Note: In production, use a secure password and change it immediately
INSERT INTO users (username, password) VALUES 
('admin', '$2b$10$rQZ8ZGYHG.HAm8y9q6wX/.OqXqJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ') 
ON CONFLICT (username) DO NOTHING;

COMMIT;
