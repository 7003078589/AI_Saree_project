-- 📊 COMPREHENSIVE SQL QUERIES FOR REAL DATA
-- Copy and paste these queries into pgAdmin to insert your real data

-- ===============================================
-- 1. SERIAL MASTER DATA INSERTION
-- ===============================================

-- Insert your real sari inventory data
INSERT INTO serial_master (serial_number, entry_date, design_code, current_process, current_location, current_code, is_rejected) VALUES
-- Replace these sample entries with your real data
('SARI001', '2024-01-15', 'DESIGN001', 'Kora', 'Production Floor A', 'KORA001', false),
('SARI002', '2024-01-16', 'DESIGN002', 'White', 'Production Floor B', 'WHITE002', false),
('SARI003', '2024-01-17', 'DESIGN003', 'Self', 'Production Floor C', 'SELF003', false),
('SARI004', '2024-01-18', 'DESIGN004', 'Contrast', 'Production Floor D', 'CONTRAST004', false),
('SARI005', '2024-01-19', 'DESIGN005', 'Kora', 'Production Floor A', 'KORA005', true);

-- ===============================================
-- 2. ITEM MASTER DATA INSERTION  
-- ===============================================

-- Insert your design codes and process-specific codes
INSERT INTO item_master (design_code, kora_code, white_code, self_code, contrast_code) VALUES
-- Replace these sample entries with your real design codes
('DESIGN001', 'KORA001', 'WHITE001', 'SELF001', 'CONTRAST001'),
('DESIGN002', 'KORA002', 'WHITE002', 'SELF002', 'CONTRAST002'),
('DESIGN003', 'KORA003', 'WHITE003', 'SELF003', 'CONTRAST003'),
('DESIGN004', 'KORA004', 'WHITE004', 'SELF004', 'CONTRAST004'),
('DESIGN005', 'KORA005', 'WHITE005', 'SELF005', 'CONTRAST005'),
('DESIGN006', 'KORA006', 'WHITE006', 'SELF006', 'CONTRAST006');

-- ===============================================
-- 3. MOVEMENT LOG DATA INSERTION
-- ===============================================

-- Insert your production movement history
INSERT INTO movement_log (serial_number, movement_date, from_process, to_process, location) VALUES
-- Replace these sample entries with your real movement data
('SARI001', '2024-01-15 08:00:00', 'Entry', 'Kora', 'Production Floor A'),
('SARI001', '2024-01-15 12:00:00', 'Kora', 'White', 'Production Floor B'),
('SARI001', '2024-01-15 16:00:00', 'White', 'Self', 'Production Floor C'),
('SARI001', '2024-01-15 18:00:00', 'Self', 'Contrast', 'Production Floor D'),
('SARI002', '2024-01-16 09:00:00', 'Entry', 'Kora', 'Production Floor A'),
('SARI002', '2024-01-16 13:00:00', 'Kora', 'White', 'Production Floor B'),
('SARI003', '2024-01-17 10:00:00', 'Entry', 'Kora', 'Production Floor A'),
('SARI003', '2024-01-17 14:00:00', 'Kora', 'White', 'Production Floor B'),
('SARI003', '2024-01-17 17:00:00', 'White', 'Self', 'Production Floor C');

-- ===============================================
-- 4. CUSTOMERS DATA INSERTION
-- ===============================================

-- Insert your real customer data
INSERT INTO customers (name, email, phone, address, city, state, pincode, status) VALUES
-- Replace these sample entries with your real customer data
('Raj Textiles', 'raj@textiles.com', '+91-9876543210', '123 Textile Market, MG Road', 'Mumbai', 'Maharashtra', '400001', 'active'),
('Delhi Sarees', 'delhi@sarees.com', '+91-9876543211', '456 Fashion Street, CP', 'Delhi', 'Delhi', '110001', 'active'),
('Bangalore Fabrics', 'bangalore@fabrics.com', '+91-9876543212', '789 Silk Road, Brigade Road', 'Bangalore', 'Karnataka', '560001', 'active'),
('Chennai Silks', 'chennai@silks.com', '+91-9876543213', '321 T Nagar Market', 'Chennai', 'Tamil Nadu', '600017', 'active'),
('Kolkata Handlooms', 'kolkata@handlooms.com', '+91-9876543214', '654 New Market', 'Kolkata', 'West Bengal', '700073', 'active');

-- ===============================================
-- 5. SUPPLIERS DATA INSERTION
-- ===============================================

-- Insert your real supplier data
INSERT INTO suppliers (name, email, phone, address, city, state, pincode, category, status) VALUES
-- Replace these sample entries with your real supplier data
('Fabric Supplier Mumbai', 'fabric@supplier.com', '+91-9876543220', '789 Supply Chain, Andheri', 'Mumbai', 'Maharashtra', '400002', 'Fabric', 'active'),
('Dye Supplier Delhi', 'dye@supplier.com', '+91-9876543221', '321 Chemical Lane, Okhla', 'Delhi', 'Delhi', '110002', 'Dyes', 'active'),
('Equipment Supplier Bangalore', 'equipment@supplier.com', '+91-9876543222', '654 Industrial Area, Whitefield', 'Bangalore', 'Karnataka', '560002', 'Equipment', 'active'),
('Thread Supplier Chennai', 'thread@supplier.com', '+91-9876543223', '987 Textile Hub, Ambattur', 'Chennai', 'Tamil Nadu', '600058', 'Thread', 'active'),
('Accessories Supplier Kolkata', 'accessories@supplier.com', '+91-9876543224', '147 Craft Center, Salt Lake', 'Kolkata', 'West Bengal', '700064', 'Accessories', 'active');

-- ===============================================
-- 6. EXCEL EXPORT QUERIES
-- ===============================================

-- Complete Inventory Report (for Excel export)
SELECT 
    sm.serial_number,
    sm.entry_date,
    sm.design_code,
    sm.current_process,
    sm.current_location,
    sm.current_code,
    sm.is_rejected,
    im.kora_code,
    im.white_code,
    im.self_code,
    im.contrast_code,
    CASE 
        WHEN sm.is_rejected THEN 'Rejected'
        ELSE 'Active'
    END as status
FROM serial_master sm
LEFT JOIN item_master im ON sm.design_code = im.design_code
ORDER BY sm.entry_date DESC;

-- Movement History Report (for Excel export)
SELECT 
    ml.serial_number,
    ml.movement_date,
    ml.from_process,
    ml.to_process,
    ml.location,
    sm.design_code,
    sm.current_process as current_status
FROM movement_log ml
LEFT JOIN serial_master sm ON ml.serial_number = sm.serial_number
ORDER BY ml.movement_date DESC;

-- Production Summary Report (for Excel export)
SELECT 
    current_process,
    COUNT(*) as total_count,
    SUM(CASE WHEN is_rejected THEN 1 ELSE 0 END) as rejected_count,
    SUM(CASE WHEN is_rejected THEN 0 ELSE 1 END) as active_count,
    ROUND(
        (SUM(CASE WHEN is_rejected THEN 0 ELSE 1 END)::decimal / COUNT(*)) * 100, 2
    ) as success_rate_percent
FROM serial_master
GROUP BY current_process
ORDER BY total_count DESC;

-- Daily Production Report (for Excel export)
SELECT 
    DATE(entry_date) as production_date,
    COUNT(*) as total_entries,
    COUNT(CASE WHEN current_process = 'Kora' THEN 1 END) as kora_count,
    COUNT(CASE WHEN current_process = 'White' THEN 1 END) as white_count,
    COUNT(CASE WHEN current_process = 'Self' THEN 1 END) as self_count,
    COUNT(CASE WHEN current_process = 'Contrast' THEN 1 END) as contrast_count,
    COUNT(CASE WHEN is_rejected = true THEN 1 END) as rejected_count
FROM serial_master
WHERE entry_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(entry_date)
ORDER BY production_date DESC;

-- Location-wise Inventory Report (for Excel export)
SELECT 
    current_location,
    current_process,
    COUNT(*) as item_count,
    COUNT(CASE WHEN is_rejected THEN 1 END) as rejected_count,
    COUNT(CASE WHEN is_rejected = false THEN 1 END) as active_count
FROM serial_master
WHERE current_location IS NOT NULL
GROUP BY current_location, current_process
ORDER BY current_location, current_process;

-- Design Code Analysis Report (for Excel export)
SELECT 
    im.design_code,
    im.kora_code,
    im.white_code,
    im.self_code,
    im.contrast_code,
    COUNT(sm.serial_number) as total_produced,
    COUNT(CASE WHEN sm.is_rejected = false THEN 1 END) as active_count,
    COUNT(CASE WHEN sm.is_rejected = true THEN 1 END) as rejected_count,
    ROUND(
        (COUNT(CASE WHEN sm.is_rejected = false THEN 1 END)::decimal / COUNT(sm.serial_number)) * 100, 2
    ) as success_rate_percent
FROM item_master im
LEFT JOIN serial_master sm ON im.design_code = sm.design_code
GROUP BY im.design_code, im.kora_code, im.white_code, im.self_code, im.contrast_code
ORDER BY total_produced DESC;

-- Customer & Supplier Combined Report (for Excel export)
SELECT 
    'Customer' as type,
    name,
    email,
    phone,
    city,
    state,
    NULL as category,
    status
FROM customers
UNION ALL
SELECT 
    'Supplier' as type,
    name,
    email,
    phone,
    city,
    state,
    category,
    status
FROM suppliers
ORDER BY type, name;

-- ===============================================
-- 7. ANALYTICS QUERIES
-- ===============================================

-- Production Efficiency Analysis
SELECT 
    DATE(entry_date) as date,
    COUNT(*) as total_produced,
    COUNT(CASE WHEN is_rejected = false THEN 1 END) as successful,
    COUNT(CASE WHEN is_rejected = true THEN 1 END) as rejected,
    ROUND(
        (COUNT(CASE WHEN is_rejected = false THEN 1 END)::decimal / COUNT(*)) * 100, 2
    ) as efficiency_percent
FROM serial_master
WHERE entry_date >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(entry_date)
ORDER BY date DESC;

-- Process Flow Analysis
SELECT 
    from_process,
    to_process,
    COUNT(*) as movement_count,
    AVG(EXTRACT(EPOCH FROM (movement_date - LAG(movement_date) OVER (PARTITION BY serial_number ORDER BY movement_date)))/3600) as avg_hours_between_movements
FROM movement_log
GROUP BY from_process, to_process
ORDER BY movement_count DESC;

-- Top Performing Design Codes
SELECT 
    im.design_code,
    COUNT(sm.serial_number) as total_produced,
    COUNT(CASE WHEN sm.is_rejected = false THEN 1 END) as successful,
    ROUND(
        (COUNT(CASE WHEN sm.is_rejected = false THEN 1 END)::decimal / COUNT(sm.serial_number)) * 100, 2
    ) as success_rate_percent
FROM item_master im
LEFT JOIN serial_master sm ON im.design_code = sm.design_code
GROUP BY im.design_code
HAVING COUNT(sm.serial_number) > 0
ORDER BY success_rate_percent DESC, total_produced DESC;

-- ===============================================
-- 8. DATA VALIDATION QUERIES
-- ===============================================

-- Check for orphaned movement logs
SELECT 
    ml.serial_number,
    ml.movement_date,
    'Missing in serial_master' as issue
FROM movement_log ml
LEFT JOIN serial_master sm ON ml.serial_number = sm.serial_number
WHERE sm.serial_number IS NULL;

-- Check for orphaned serial masters
SELECT 
    sm.serial_number,
    sm.design_code,
    'Missing in item_master' as issue
FROM serial_master sm
LEFT JOIN item_master im ON sm.design_code = im.design_code
WHERE im.design_code IS NULL;

-- Check for inconsistent process codes
SELECT 
    sm.serial_number,
    sm.current_process,
    sm.current_code,
    CASE sm.current_process
        WHEN 'Kora' THEN im.kora_code
        WHEN 'White' THEN im.white_code
        WHEN 'Self' THEN im.self_code
        WHEN 'Contrast' THEN im.contrast_code
    END as expected_code,
    'Process code mismatch' as issue
FROM serial_master sm
LEFT JOIN item_master im ON sm.design_code = im.design_code
WHERE sm.current_code != CASE sm.current_process
    WHEN 'Kora' THEN im.kora_code
    WHEN 'White' THEN im.white_code
    WHEN 'Self' THEN im.self_code
    WHEN 'Contrast' THEN im.contrast_code
END;

-- ===============================================
-- 9. BULK UPDATE QUERIES
-- ===============================================

-- Update all current codes based on current process
UPDATE serial_master 
SET current_code = CASE current_process
    WHEN 'Kora' THEN (SELECT kora_code FROM item_master WHERE item_master.design_code = serial_master.design_code)
    WHEN 'White' THEN (SELECT white_code FROM item_master WHERE item_master.design_code = serial_master.design_code)
    WHEN 'Self' THEN (SELECT self_code FROM item_master WHERE item_master.design_code = serial_master.design_code)
    WHEN 'Contrast' THEN (SELECT contrast_code FROM item_master WHERE item_master.design_code = serial_master.design_code)
END
WHERE current_code IS NULL OR current_code = '';

-- Archive old movement logs (older than 1 year)
-- CREATE TABLE movement_log_archive AS 
-- SELECT * FROM movement_log WHERE movement_date < CURRENT_DATE - INTERVAL '1 year';
-- DELETE FROM movement_log WHERE movement_date < CURRENT_DATE - INTERVAL '1 year';

-- ===============================================
-- 10. USAGE INSTRUCTIONS
-- ===============================================

/*
📋 HOW TO USE THESE QUERIES:

1. DATA UPLOAD:
   - Copy the INSERT statements (sections 1-5)
   - Replace sample data with your real data
   - Run in pgAdmin Query Tool

2. EXCEL EXPORT:
   - Copy any SELECT query from section 6
   - Run in pgAdmin Query Tool
   - Right-click results → Export → CSV
   - Open CSV file in Excel

3. ANALYTICS:
   - Use queries from section 7 for insights
   - Modify date ranges as needed

4. DATA VALIDATION:
   - Run queries from section 8 to check data quality
   - Fix any issues found

5. MAINTENANCE:
   - Use queries from section 9 for bulk updates
   - Run periodically to keep data clean

💡 TIPS:
- Always backup your data before running UPDATE/DELETE queries
- Test queries on a small dataset first
- Use transactions for multiple related operations
- Export frequently to Excel for analysis
*/
