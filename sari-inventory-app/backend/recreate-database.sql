-- Drop existing tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS movement_log CASCADE;
DROP TABLE IF EXISTS serial_master CASCADE;
DROP TABLE IF EXISTS item_master CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;

-- Create new serial_master table matching the format from images
CREATE TABLE serial_master (
    id SERIAL PRIMARY KEY,
    numbr INTEGER NOT NULL,
    serial_number VARCHAR(50) NOT NULL UNIQUE,
    item_code VARCHAR(255) NOT NULL,
    entry_date DATE NOT NULL,
    batch_number INTEGER,
    current_process VARCHAR(100),
    current_code VARCHAR(255),
    latest_movement_dt VARCHAR(100) DEFAULT 'No Movement',
    current_location VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create new item_master table matching the format from images
CREATE TABLE item_master (
    id SERIAL PRIMARY KEY,
    item_code VARCHAR(255) NOT NULL UNIQUE,
    kora VARCHAR(255),
    white VARCHAR(255),
    self VARCHAR(255),
    contrast VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create new movement_log table matching the format from images
CREATE TABLE movement_log (
    id SERIAL PRIMARY KEY,
    serial_number VARCHAR(50) NOT NULL,
    item_code VARCHAR(255) NOT NULL,
    movement_date DATE,
    done_to_process VARCHAR(255),
    from_process VARCHAR(255),
    body_colour VARCHAR(100),
    border_colour VARCHAR(100),
    from_location VARCHAR(255),
    to_location VARCHAR(255),
    quality VARCHAR(100),
    document_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create customers table
CREATE TABLE customers (
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

-- Create suppliers table
CREATE TABLE suppliers (
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_serial_master_serial_number ON serial_master(serial_number);
CREATE INDEX IF NOT EXISTS idx_serial_master_item_code ON serial_master(item_code);
CREATE INDEX IF NOT EXISTS idx_serial_master_current_process ON serial_master(current_process);
CREATE INDEX IF NOT EXISTS idx_movement_log_serial_number ON movement_log(serial_number);
CREATE INDEX IF NOT EXISTS idx_movement_log_item_code ON movement_log(item_code);
CREATE INDEX IF NOT EXISTS idx_movement_log_movement_date ON movement_log(movement_date);
CREATE INDEX IF NOT EXISTS idx_item_master_item_code ON item_master(item_code);

-- Insert sample data for testing
INSERT INTO item_master (item_code, kora, white, self, contrast) VALUES
('Checks D00001 Big Checks', 'Kora Checks D00001 Big Checks', 'White Checks D00001 Big Checks', 'Self Checks D00001 Big Checks', 'Contrast Checks D00001 Big Checks'),
('Plain D00002 Big Checks', 'Kora Plain D00002 Big Checks', 'White Plain D00002 Big Checks', 'Self Plain D00002 Big Checks', 'Contrast Plain D00002 Big Checks'),
('Checks D00003 Warp Line Checks', 'Kora Checks D00003 Warp Line Checks', 'White Checks D00003 Warp Line Checks', 'Self Checks D00003 Warp Line Checks', 'Contrast Checks D00003 Warp Line Checks'),
('Plain D00004 Warp Line Checks', 'Kora Plain D00004 Warp Line Checks', 'White Plain D00004 Warp Line Checks', 'Self Plain D00004 Warp Line Checks', 'Contrast Plain D00004 Warp Line Checks'),
('Checks D00005 4 Link Checks', 'Kora Checks D00005 4 Link Checks', 'White Checks D00005 4 Link Checks', 'Self Checks D00005 4 Link Checks', 'Contrast Checks D00005 4 Link Checks'),
('Plain D00006 4 Link Checks', 'Kora Plain D00006 4 Link Checks', 'White Plain D00006 4 Link Checks', 'Self Plain D00006 4 Link Checks', 'Contrast Plain D00006 4 Link Checks'),
('Checks D00007 Tennis Checks', 'Kora Checks D00007 Tennis Checks', 'White Checks D00007 Tennis Checks', 'Self Checks D00007 Tennis Checks', 'Contrast Checks D00007 Tennis Checks'),
('Plain D00008 Tennis Checks', 'Kora Plain D00008 Tennis Checks', 'White Plain D00008 Tennis Checks', 'Self Plain D00008 Tennis Checks', 'Contrast Plain D00008 Tennis Checks'),
('Checks D00009 1/2" 2 Line Checks', 'Kora Checks D00009 1/2" 2 Line Checks', 'White Checks D00009 1/2" 2 Line Checks', 'Self Checks D00009 1/2" 2 Line Checks', 'Contrast Checks D00009 1/2" 2 Line Checks'),
('Plain D00010 1/2" 2 Line Checks', 'Kora Plain D00010 1/2" 2 Line Checks', 'White Plain D00010 1/2" 2 Line Checks', 'Self Plain D00010 1/2" 2 Line Checks', 'Contrast Plain D00010 1/2" 2 Line Checks'),
('Checks D00011 2 Line Checks', 'Kora Checks D00011 2 Line Checks', 'White Checks D00011 2 Line Checks', 'Self Checks D00011 2 Line Checks', 'Contrast Checks D00011 2 Line Checks'),
('Plain D00012 2 Line Checks', 'Kora Plain D00012 2 Line Checks', 'White Plain D00012 2 Line Checks', 'Self Plain D00012 2 Line Checks', 'Contrast Plain D00012 2 Line Checks'),
('Plain D00013 Thorana', 'Kora Plain D00013 Thorana', 'White Plain D00013 Thorana', 'Self Plain D00013 Thorana', 'Contrast Plain D00013 Thorana'),
('Plain D00014 Kalasa', 'Kora Plain D00014 Kalasa', 'White Plain D00014 Kalasa', 'Self Plain D00014 Kalasa', 'Contrast Plain D00014 Kalasa'),
('Plain D00015 1/4" Border', 'Kora Plain D00015 1/4" Border', 'White Plain D00015 1/4" Border', 'Self Plain D00015 1/4" Border', 'Contrast Plain D00015 1/4" Border'),
('Plain D00016 Temple', 'Kora Plain D00016 Temple', 'White Plain D00016 Temple', 'Self Plain D00016 Temple', 'Contrast Plain D00016 Temple'),
('Checks D00017 Big Mango Border', 'Kora Checks D00017 Big Mango Border', 'White Checks D00017 Big Mango Border', 'Self Checks D00017 Big Mango Border', 'Contrast Checks D00017 Big Mango Border'),
('Plain D00018 Big Mango Border', 'Kora Plain D00018 Big Mango Border', 'White Plain D00018 Big Mango Border', 'Self Plain D00018 Big Mango Border', 'Contrast Plain D00018 Big Mango Border'),
('Checks D00019 Bentex', 'Kora Checks D00019 Bentex', 'White Checks D00019 Bentex', 'Self Checks D00019 Bentex', 'Contrast Checks D00019 Bentex'),
('Plain D00020 Bentex', 'Kora Plain D00020 Bentex', 'White Plain D00020 Bentex', 'Self Plain D00020 Bentex', 'Contrast Plain D00020 Bentex'),
('Checks D00021 Egyptian', 'Kora Checks D00021 Egyptian', 'White Checks D00021 Egyptian', 'Self Checks D00021 Egyptian', 'Contrast Checks D00021 Egyptian'),
('Plain D00022 Egyptian', 'Kora Plain D00022 Egyptian', 'White Plain D00022 Egyptian', 'Self Plain D00022 Egyptian', 'Contrast Plain D00022 Egyptian'),
('Checks D00023 Leaf Border', 'Kora Checks D00023 Leaf Border', 'White Checks D00023 Leaf Border', 'Self Checks D00023 Leaf Border', 'Contrast Checks D00023 Leaf Border'),
('Plain D00024 Leaf Border', 'Kora Plain D00024 Leaf Border', 'White Plain D00024 Leaf Border', 'Self Plain D00024 Leaf Border', 'Contrast Plain D00024 Leaf Border'),
('Checks D00025 Thene Border', 'Kora Checks D00025 Thene Border', 'White Checks D00025 Thene Border', 'Self Checks D00025 Thene Border', 'Contrast Checks D00025 Thene Border'),
('Plain D00026 Thene Border', 'Kora Plain D00026 Thene Border', 'White Plain D00026 Thene Border', 'Self Plain D00026 Thene Border', 'Contrast Plain D00026 Thene Border'),
('Plain D00027 Diamond Checks', 'Kora Plain D00027 Diamond Checks', 'White Plain D00027 Diamond Checks', 'Self Plain D00027 Diamond Checks', 'Contrast Plain D00027 Diamond Checks'),
('Checks D00028 Diamond Checks', 'Kora Checks D00028 Diamond Checks', 'White Checks D00028 Diamond Checks', 'Self Checks D00028 Diamond Checks', 'Contrast Checks D00028 Diamond Checks'),
('Plain D00029 Star Border', 'Kora Plain D00029 Star Border', 'White Plain D00029 Star Border', 'Self Plain D00029 Star Border', 'Contrast Plain D00029 Star Border'),
('Checks D00030 Star Border', 'Kora Checks D00030 Star Border', 'White Checks D00030 Star Border', 'Self Checks D00030 Star Border', 'Contrast Checks D00030 Star Border'),
('Plain D00031 Flower Border', 'Kora Plain D00031 Flower Border', 'White Plain D00031 Flower Border', 'Self Plain D00031 Flower Border', 'Contrast Plain D00031 Flower Border'),
('Checks D00032 Flower Border', 'Kora Checks D00032 Flower Border', 'White Checks D00032 Flower Border', 'Self Checks D00032 Flower Border', 'Contrast Checks D00032 Flower Border'),
('Plain D00033 Geometric Border', 'Kora Plain D00033 Geometric Border', 'White Plain D00033 Geometric Border', 'Self Plain D00033 Geometric Border', 'Contrast Plain D00033 Geometric Border'),
('Checks D00034 Geo Star', 'Kora Checks D00034 Geo Star', 'White Checks D00034 Geo Star', 'Self Checks D00034 Geo Star', 'Contrast Checks D00034 Geo Star'),
('Plain D00035 Geo Star', 'Kora Plain D00035 Geo Star', 'White Plain D00035 Geo Star', 'Self Plain D00035 Geo Star', 'Contrast Plain D00035 Geo Star'),
('Checks D00036 Modern Border', 'Kora Checks D00036 Modern Border', 'White Checks D00036 Modern Border', 'Self Checks D00036 Modern Border', 'Contrast Checks D00036 Modern Border'),
('Plain D00037 Modern Border', 'Kora Plain D00037 Modern Border', 'White Plain D00037 Modern Border', 'Self Plain D00037 Modern Border', 'Contrast Plain D00037 Modern Border'),
('Checks D00038 Traditional Border', 'Kora Checks D00038 Traditional Border', 'White Checks D00038 Traditional Border', 'Self Checks D00038 Traditional Border', 'Contrast Checks D00038 Traditional Border'),
('Plain D00039 Traditional Border', 'Kora Plain D00039 Traditional Border', 'White Plain D00039 Traditional Border', 'Self Plain D00039 Traditional Border', 'Contrast Plain D00039 Traditional Border'),
('Checks D00040 Classic Border', 'Kora Checks D00040 Classic Border', 'White Checks D00040 Classic Border', 'Self Checks D00040 Classic Border', 'Contrast Checks D00040 Classic Border'),
('Plain D00041 Classic Border', 'Kora Plain D00041 Classic Border', 'White Plain D00041 Classic Border', 'Self Plain D00041 Classic Border', 'Contrast Plain D00041 Classic Border'),
('Checks D00042 Elegant Border', 'Kora Checks D00042 Elegant Border', 'White Checks D00042 Elegant Border', 'Self Checks D00042 Elegant Border', 'Contrast Checks D00042 Elegant Border'),
('Plain D00043 Elegant Border', 'Kora Plain D00043 Elegant Border', 'White Plain D00043 Elegant Border', 'Self Plain D00043 Elegant Border', 'Contrast Plain D00043 Elegant Border'),
('Checks D00044 Royal Border', 'Kora Checks D00044 Royal Border', 'White Checks D00044 Royal Border', 'Self Checks D00044 Royal Border', 'Contrast Checks D00044 Royal Border'),
('Plain D00045 Royal Border', 'Kora Plain D00045 Royal Border', 'White Plain D00045 Royal Border', 'Self Plain D00045 Royal Border', 'Contrast Plain D00045 Royal Border'),
('Checks D00046 Premium Border', 'Kora Checks D00046 Premium Border', 'White Checks D00046 Premium Border', 'Self Checks D00046 Premium Border', 'Contrast Checks D00046 Premium Border'),
('Plain D00047 Premium Border', 'Kora Plain D00047 Premium Border', 'White Plain D00047 Premium Border', 'Self Plain D00047 Premium Border', 'Contrast Plain D00047 Premium Border'),
('Checks D00048 Luxury Border', 'Kora Checks D00048 Luxury Border', 'White Checks D00048 Luxury Border', 'Self Checks D00048 Luxury Border', 'Contrast Checks D00048 Luxury Border'),
('Plain D00049 Luxury Border', 'Kora Plain D00049 Luxury Border', 'White Plain D00049 Luxury Border', 'Self Plain D00049 Luxury Border', 'Contrast Plain D00049 Luxury Border'),
('Checks D00050 Designer Border', 'Kora Checks D00050 Designer Border', 'White Checks D00050 Designer Border', 'Self Checks D00050 Designer Border', 'Contrast Checks D00050 Designer Border'),
('Plain D00051 1/2" X Border', 'Kora Plain D00051 1/2" X Border', 'White Plain D00051 1/2" X Border', 'Self Plain D00051 1/2" X Border', 'Contrast Plain D00051 1/2" X Border'),
('Checks D00052 1/2" X Border', 'Kora Checks D00052 1/2" X Border', 'White Checks D00052 1/2" X Border', 'Self Checks D00052 1/2" X Border', 'Contrast Checks D00052 1/2" X Border'),
('Plain D00053 3/4" Border', 'Kora Plain D00053 3/4" Border', 'White Plain D00053 3/4" Border', 'Self Plain D00053 3/4" Border', 'Contrast Plain D00053 3/4" Border'),
('Plain D00054 Jyothi Border', 'Kora Plain D00054 Jyothi Border', 'White Plain D00054 Jyothi Border', 'Self Plain D00054 Jyothi Border', 'Contrast Plain D00054 Jyothi Border'),
('Checks D00055 Jyothi Border', 'Kora Checks D00055 Jyothi Border', 'White Checks D00055 Jyothi Border', 'Self Checks D00055 Jyothi Border', 'Contrast Checks D00055 Jyothi Border'),
('Checks D00056 Balli 3 Line Checks', 'Kora Checks D00056 Balli 3 Line Checks', 'White Checks D00056 Balli 3 Line Checks', 'Self Checks D00056 Balli 3 Line Checks', 'Contrast Checks D00056 Balli 3 Line Checks'),
('Plain D00057 Balli 3 Line Checks', 'Kora Plain D00057 Balli 3 Line Checks', 'White Plain D00057 Balli 3 Line Checks', 'Self Plain D00057 Balli 3 Line Checks', 'Contrast Plain D00057 Balli 3 Line Checks'),
('Checks D00058 Balli 4 Line Checks', 'Kora Checks D00058 Balli 4 Line Checks', 'White Checks D00058 Balli 4 Line Checks', 'Self Checks D00058 Balli 4 Line Checks', 'Contrast Checks D00058 Balli 4 Line Checks'),
('Plain D00059 Balli 4 Line Checks', 'Kora Plain D00059 Balli 4 Line Checks', 'White Plain D00059 Balli 4 Line Checks', 'Self Plain D00059 Balli 4 Line Checks', 'Contrast Plain D00059 Balli 4 Line Checks'),
('Checks D00060 Balli 5 Line Checks', 'Kora Checks D00060 Balli 5 Line Checks', 'White Checks D00060 Balli 5 Line Checks', 'Self Checks D00060 Balli 5 Line Checks', 'Contrast Checks D00060 Balli 5 Line Checks'),
('Checks D00061 Flower Star', 'Kora Checks D00061 Flower Star', 'White Checks D00061 Flower Star', 'Self Checks D00061 Flower Star', 'Contrast Checks D00061 Flower Star'),
('Plain D00062 Flower Star', 'Kora Plain D00062 Flower Star', 'White Plain D00062 Flower Star', 'Self Plain D00062 Flower Star', 'Contrast Plain D00062 Flower Star'),
('Checks D00063 Star Pattern', 'Kora Checks D00063 Star Pattern', 'White Checks D00063 Star Pattern', 'Self Checks D00063 Star Pattern', 'Contrast Checks D00063 Star Pattern'),
('Plain D00064 Star Pattern', 'Kora Plain D00064 Star Pattern', 'White Plain D00064 Star Pattern', 'Self Plain D00064 Star Pattern', 'Contrast Plain D00064 Star Pattern'),
('Pallu Chx D00065 Small Pyramids', 'Kora Pallu Chx D00065 Small Pyramids', 'White Pallu Chx D00065 Small Pyramids', 'Self Pallu Chx D00065 Small Pyramids', 'Contrast Pallu Chx D00065 Small Pyramids'),
('Pallu Chx D00066 Flower Border', 'Kora Pallu Chx D00066 Flower Border', 'White Pallu Chx D00066 Flower Border', 'Self Pallu Chx D00066 Flower Border', 'Contrast Pallu Chx D00066 Flower Border'),
('Pallu Chx D00067 Geometric Pattern', 'Kora Pallu Chx D00067 Geometric Pattern', 'White Pallu Chx D00067 Geometric Pattern', 'Self Pallu Chx D00067 Geometric Pattern', 'Contrast Pallu Chx D00067 Geometric Pattern'),
('Pallu Chx D00068 Traditional Pattern', 'Kora Pallu Chx D00068 Traditional Pattern', 'White Pallu Chx D00068 Traditional Pattern', 'Self Pallu Chx D00068 Traditional Pattern', 'Contrast Pallu Chx D00068 Traditional Pattern'),
('Pallu Chx D00069 Modern Pattern', 'Kora Pallu Chx D00069 Modern Pattern', 'White Pallu Chx D00069 Modern Pattern', 'Self Pallu Chx D00069 Modern Pattern', 'Contrast Pallu Chx D00069 Modern Pattern'),
('Pallu Chx D00070 Classic Pattern', 'Kora Pallu Chx D00070 Classic Pattern', 'White Pallu Chx D00070 Classic Pattern', 'Self Pallu Chx D00070 Classic Pattern', 'Contrast Pallu Chx D00070 Classic Pattern');

-- Insert sample serial_master data
INSERT INTO serial_master (numbr, serial_number, item_code, entry_date, batch_number, current_process, current_code, latest_movement_dt, current_location) VALUES
(6421, 'E6421', 'Checks D00001 Big Checks', '2025-06-13', 7, 'Kora', 'Kora Checks D00001 Big Checks', 'No Movement', ''),
(6420, 'E6420', 'Checks D00001 Big Checks', '2025-06-13', 7, 'Kora', 'Kora Checks D00001 Big Checks', 'No Movement', ''),
(6422, 'E6422', 'Checks D00001 Big Checks', '2025-06-13', 7, 'Kora', 'Kora Checks D00001 Big Checks', 'No Movement', ''),
(6441, 'E6441', 'Checks D00061 Flower Star', '2025-06-13', 7, 'Kora', 'Kora Checks D00061 Flower Star', 'No Movement', ''),
(6423, 'E6423', 'Plain D00014 Kalasa', '2025-06-13', 7, 'Kora', 'Kora Plain D00014 Kalasa', 'No Movement', ''),
(6424, 'E6424', 'Plain D00014 Kalasa', '2025-06-13', 7, 'Kora', 'Kora Plain D00014 Kalasa', 'No Movement', ''),
(6425, 'E6425', 'Plain D00014 Kalasa', '2025-06-13', 7, 'Kora', 'Kora Plain D00014 Kalasa', 'No Movement', ''),
(6426, 'E6426', 'Pallu Chx D00065 Small Pyramids', '2025-06-13', 7, 'Kora', 'Kora Pallu Chx D00065 Small Pyramids', 'No Movement', ''),
(6427, 'E6427', 'Pallu Chx D00065 Small Pyramids', '2025-06-13', 7, 'Kora', 'Kora Pallu Chx D00065 Small Pyramids', 'No Movement', ''),
(6428, 'E6428', 'Pallu Chx D00065 Small Pyramids', '2025-06-13', 7, 'Kora', 'Kora Pallu Chx D00065 Small Pyramids', 'No Movement', ''),
(6429, 'E6429', 'Pallu Chx D00065 Small Pyramids', '2025-06-13', 7, 'Kora', 'Kora Pallu Chx D00065 Small Pyramids', 'No Movement', ''),
(6430, 'E6430', 'Plain D00027 Diamond Checks', '2025-06-13', 7, 'Kora', 'Kora Plain D00027 Diamond Checks', 'No Movement', ''),
(6431, 'E6431', 'Plain D00027 Diamond Checks', '2025-06-13', 7, 'Kora', 'Kora Plain D00027 Diamond Checks', 'No Movement', ''),
(6432, 'E6432', 'Plain D00027 Diamond Checks', '2025-06-13', 7, 'Kora', 'Kora Plain D00027 Diamond Checks', 'No Movement', ''),
(6433, 'E6433', 'Plain D00027 Diamond Checks', '2025-06-13', 7, 'Kora', 'Kora Plain D00027 Diamond Checks', 'No Movement', ''),
(6434, 'E6434', 'Plain D00027 Diamond Checks', '2025-06-13', 7, 'Kora', 'Kora Plain D00027 Diamond Checks', 'No Movement', ''),
(6435, 'E6435', 'Plain D00027 Diamond Checks', '2025-06-13', 7, 'Kora', 'Kora Plain D00027 Diamond Checks', 'No Movement', ''),
(6436, 'E6436', 'Pallu Chx D00065 Small Pyramids', '2025-06-13', 7, 'Kora', 'Kora Pallu Chx D00065 Small Pyramids', 'No Movement', ''),
(6437, 'E6437', 'Pallu Chx D00066 Flower Border', '2025-06-13', 7, 'Kora', 'Kora Pallu Chx D00066 Flower Border', 'No Movement', ''),
(6438, 'E6438', 'Pallu Chx D00066 Flower Border', '2025-06-13', 7, 'Kora', 'Kora Pallu Chx D00066 Flower Border', 'No Movement', ''),
(6439, 'E6439', 'Pallu Chx D00066 Flower Border', '2025-06-13', 7, 'Kora', 'Kora Pallu Chx D00066 Flower Border', 'No Movement', ''),
(6440, 'E6440', 'Pallu Chx D00066 Flower Border', '2025-06-13', 7, 'Kora', 'Kora Pallu Chx D00066 Flower Border', 'No Movement', ''),
(6411, 'E6411', 'Pallu Chx D00066 Flower Border', '2025-06-13', 7, 'Kora', 'Kora Pallu Chx D00066 Flower Border', 'No Movement', '');

-- Insert sample movement_log data
INSERT INTO movement_log (serial_number, item_code, movement_date, done_to_process, from_process, body_colour, border_colour, from_location, to_location, quality, document_number, notes) VALUES
('E5900', 'Plain D00015 1/4" Border', '2025-09-02', '', 'Self Dyed', '', '', '', '1C', '', '', ''),
('E5368', 'Plain D00025 Thene Border', '2025-09-02', '', 'Self Dyed', '', '', '', '1C', '', '', ''),
('E5582', 'Checks D00011 2 Line Checks', '2025-09-02', '', 'Self Dyed', '', '', '', '1C', '', '', ''),
('E5892', 'Plain D00054 Jyothi Border', '2025-09-02', '', 'Self Dyed', '', '', '', '1C', '', '', ''),
('E5721', 'Checks D00056 Balli 3 Line Checks', '2025-09-02', '', 'Self Dyed', '', '', '', '1C', '', '', ''),
('E5126', 'Plain D00051 1/2" X Border', '2025-09-02', '', 'Self Dyed', '', '', '', '1C', '', '', ''),
('E5217', 'Checks D00034 Geo Star', '2025-09-02', '', 'Self Dyed', '', '', '', '1C', '', '', ''),
('E5133', 'Plain D00051 1/2" X Border', '2025-09-02', '', 'Self Dyed', '', '', '', '1C', '', '', ''),
('E4697', 'Checks D00011 2 Line Checks', '2025-09-02', '', 'Self Dyed', '', '', '', '1C', '', '', ''),
('E5269', 'Plain D00025 Thene Border', '2025-09-02', '', 'Self Dyed', '', '', '', '1C', '', '', ''),
('E5175', 'Checks D00056 Balli 3 Line Checks', '2025-09-02', '', 'Self Dyed', '', '', '', '1C', '', '', ''),
('E5045', 'Plain D00015 1/4" Border', '2025-09-02', '', 'Self Dyed', '', '', '', '1C', '', '', ''),
('E5174', 'Checks D00034 Geo Star', '2025-09-02', '', 'Self Dyed', '', '', '', '1C', '', '', ''),
('E5656', 'Plain D00054 Jyothi Border', '2025-09-02', '', 'Self Dyed', '', '', '', '1C', '', '', ''),
('E5643', 'Checks D00011 2 Line Checks', '2025-09-02', '', 'Self Dyed', '', '', '', '1C', '', '', ''),
('E5634', 'Plain D00051 1/2" X Border', '2025-09-02', '', 'Self Dyed', '', '', '', '1C', '', '', ''),
('E5848', 'Checks D00056 Balli 3 Line Checks', '2025-09-02', '', 'Self Dyed', '', '', '', '1C', '', '', ''),
('E5636', 'Plain D00025 Thene Border', '2025-09-02', '', 'Self Dyed', '', '', '', '1C', '', '', ''),
('E5843', 'Checks D00034 Geo Star', '2025-09-02', '', 'Self Dyed', '', '', '', '1C', '', '', ''),
('E5635', 'Plain D00015 1/4" Border', '2025-09-02', '', 'Self Dyed', '', '', '', '1C', '', '', ''),
('E5512', 'Checks D00011 2 Line Checks', '2025-09-02', '', 'Self Dyed', '', '', '', '1C', '', '', ''),
('E5518', 'Plain D00054 Jyothi Border', '2025-09-02', '', 'Self Dyed', '', '', '', '1C', '', '', ''),
('E5845', 'Checks D00056 Balli 3 Line Checks', '2025-09-02', '', 'Self Dyed', '', '', '', '1C', '', '', ''),
('E5242', 'Plain D00051 1/2" X Border', '2025-09-02', '', 'Self Dyed', '', '', '', '1C', '', '', '');

-- Insert sample customers and suppliers
INSERT INTO customers (name, email, phone, city, state) VALUES
('Sample Customer 1', 'customer1@example.com', '+91-9876543210', 'Mumbai', 'Maharashtra'),
('Sample Customer 2', 'customer2@example.com', '+91-9876543211', 'Delhi', 'Delhi'),
('Sample Customer 3', 'customer3@example.com', '+91-9876543212', 'Bangalore', 'Karnataka');

INSERT INTO suppliers (name, email, phone, city, state, category) VALUES
('Sample Supplier 1', 'supplier1@example.com', '+91-9876543220', 'Mumbai', 'Maharashtra', 'Fabric'),
('Sample Supplier 2', 'supplier2@example.com', '+91-9876543221', 'Delhi', 'Delhi', 'Dyes'),
('Sample Supplier 3', 'supplier3@example.com', '+91-9876543222', 'Bangalore', 'Karnataka', 'Equipment');

COMMIT;
