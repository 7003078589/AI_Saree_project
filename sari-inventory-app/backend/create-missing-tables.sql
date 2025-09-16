-- Create customers table if it doesn't exist
CREATE TABLE IF NOT EXISTS customers (
    customer_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create suppliers table if it doesn't exist
CREATE TABLE IF NOT EXISTS suppliers (
    supplier_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    category VARCHAR(100) DEFAULT 'general',
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Add some sample data for testing
INSERT INTO customers (name, email, phone, city, state) VALUES
('Sample Customer 1', 'customer1@example.com', '+91-9876543210', 'Mumbai', 'Maharashtra'),
('Sample Customer 2', 'customer2@example.com', '+91-9876543211', 'Delhi', 'Delhi'),
('Sample Customer 3', 'customer3@example.com', '+91-9876543212', 'Bangalore', 'Karnataka')
ON CONFLICT DO NOTHING;

INSERT INTO suppliers (name, email, phone, city, state, category) VALUES
('Sample Supplier 1', 'supplier1@example.com', '+91-9876543220', 'Mumbai', 'Maharashtra', 'Fabric'),
('Sample Supplier 2', 'supplier2@example.com', '+91-9876543221', 'Delhi', 'Delhi', 'Dyes'),
('Sample Supplier 3', 'supplier3@example.com', '+91-9876543222', 'Bangalore', 'Karnataka', 'Equipment')
ON CONFLICT DO NOTHING;

-- Add some sample movement logs for testing
INSERT INTO movement_log (serial_number, movement_date, from_process, to_process, location) VALUES
('SARI001', NOW() - INTERVAL '2 hours', 'Kora', 'White', 'Test Location'),
('SARI002', NOW() - INTERVAL '1 hour', 'Kora', 'White', 'Location B'),
('SARI003', NOW() - INTERVAL '30 minutes', 'White', 'Self', 'Location C')
ON CONFLICT DO NOTHING;
