const { pool } = require('./config/database');
const fs = require('fs');
const path = require('path');

// 📊 UPLOAD REAL DATA FROM EXCEL/CSV FILES
// This script helps you upload your real sari inventory data

async function uploadRealData() {
  try {
    console.log('🚀 Starting Real Data Upload Process...\n');
    
    // Method 1: Upload from CSV files
    console.log('📁 Method 1: CSV File Upload');
    console.log('   Create CSV files in the following format:\n');
    
    // Show CSV format examples
    console.log('📋 serial_master.csv format:');
    console.log('   serial_number,entry_date,design_code,current_process,current_location,current_code,is_rejected');
    console.log('   SARI001,2024-01-15,DESIGN001,Kora,Production Floor A,KORA001,false');
    console.log('   SARI002,2024-01-16,DESIGN002,White,Production Floor B,WHITE002,false\n');
    
    console.log('📋 item_master.csv format:');
    console.log('   design_code,kora_code,white_code,self_code,contrast_code');
    console.log('   DESIGN001,KORA001,WHITE001,SELF001,CONTRAST001');
    console.log('   DESIGN002,KORA002,WHITE002,SELF002,CONTRAST002\n');
    
    console.log('📋 movement_log.csv format:');
    console.log('   serial_number,movement_date,from_process,to_process,location');
    console.log('   SARI001,2024-01-15 10:00:00,Entry,Kora,Production Floor A');
    console.log('   SARI001,2024-01-15 14:00:00,Kora,White,Production Floor B\n');
    
    console.log('📋 customers.csv format:');
    console.log('   name,email,phone,address,city,state,pincode');
    console.log('   "Raj Textiles","raj@textiles.com","+91-9876543210","123 Textile Market","Mumbai","Maharashtra","400001"');
    console.log('   "Delhi Sarees","delhi@sarees.com","+91-9876543211","456 Fashion Street","Delhi","Delhi","110001"\n');
    
    console.log('📋 suppliers.csv format:');
    console.log('   name,email,phone,address,city,state,pincode,category');
    console.log('   "Fabric Supplier","fabric@supplier.com","+91-9876543220","789 Supply Chain","Mumbai","Maharashtra","400002","Fabric"');
    console.log('   "Dye Supplier","dye@supplier.com","+91-9876543221","321 Chemical Lane","Delhi","Delhi","110002","Dyes"\n');
    
    // Check if CSV files exist
    const csvFiles = [
      'serial_master.csv',
      'item_master.csv', 
      'movement_log.csv',
      'customers.csv',
      'suppliers.csv'
    ];
    
    console.log('🔍 Checking for CSV files...');
    const existingFiles = csvFiles.filter(file => fs.existsSync(file));
    
    if (existingFiles.length > 0) {
      console.log(`✅ Found ${existingFiles.length} CSV files:`);
      existingFiles.forEach(file => console.log(`   - ${file}`));
      
      console.log('\n📤 Ready to upload! Run: node upload-csv-data.js');
    } else {
      console.log('❌ No CSV files found in current directory');
      console.log('💡 Create CSV files with the formats shown above, then run this script again');
    }
    
  } catch (error) {
    console.error('❌ Error in upload process:', error.message);
  } finally {
    await pool.end();
  }
}

// Method 2: Direct SQL INSERT statements
function generateSQLInserts() {
  console.log('\n📝 Method 2: Direct SQL INSERT Statements\n');
  
  const sqlExamples = {
    serial_master: `
-- Insert into serial_master
INSERT INTO serial_master (serial_number, entry_date, design_code, current_process, current_location, current_code, is_rejected) VALUES
('SARI001', '2024-01-15', 'DESIGN001', 'Kora', 'Production Floor A', 'KORA001', false),
('SARI002', '2024-01-16', 'DESIGN002', 'White', 'Production Floor B', 'WHITE002', false),
('SARI003', '2024-01-17', 'DESIGN003', 'Self', 'Production Floor C', 'SELF003', false);`,

    item_master: `
-- Insert into item_master  
INSERT INTO item_master (design_code, kora_code, white_code, self_code, contrast_code) VALUES
('DESIGN001', 'KORA001', 'WHITE001', 'SELF001', 'CONTRAST001'),
('DESIGN002', 'KORA002', 'WHITE002', 'SELF002', 'CONTRAST002'),
('DESIGN003', 'KORA003', 'WHITE003', 'SELF003', 'CONTRAST003');`,

    movement_log: `
-- Insert into movement_log
INSERT INTO movement_log (serial_number, movement_date, from_process, to_process, location) VALUES
('SARI001', '2024-01-15 10:00:00', 'Entry', 'Kora', 'Production Floor A'),
('SARI001', '2024-01-15 14:00:00', 'Kora', 'White', 'Production Floor B'),
('SARI002', '2024-01-16 09:00:00', 'Entry', 'Kora', 'Production Floor A'),
('SARI002', '2024-01-16 13:00:00', 'Kora', 'White', 'Production Floor B');`,

    customers: `
-- Insert into customers
INSERT INTO customers (name, email, phone, address, city, state, pincode) VALUES
('Raj Textiles', 'raj@textiles.com', '+91-9876543210', '123 Textile Market', 'Mumbai', 'Maharashtra', '400001'),
('Delhi Sarees', 'delhi@sarees.com', '+91-9876543211', '456 Fashion Street', 'Delhi', 'Delhi', '110001'),
('Bangalore Fabrics', 'bangalore@fabrics.com', '+91-9876543212', '789 Silk Road', 'Bangalore', 'Karnataka', '560001');`,

    suppliers: `
-- Insert into suppliers
INSERT INTO suppliers (name, email, phone, address, city, state, pincode, category) VALUES
('Fabric Supplier', 'fabric@supplier.com', '+91-9876543220', '789 Supply Chain', 'Mumbai', 'Maharashtra', '400002', 'Fabric'),
('Dye Supplier', 'dye@supplier.com', '+91-9876543221', '321 Chemical Lane', 'Delhi', 'Delhi', '110002', 'Dyes'),
('Equipment Supplier', 'equipment@supplier.com', '+91-9876543222', '654 Industrial Area', 'Bangalore', 'Karnataka', '560002', 'Equipment');`
  };
  
  Object.entries(sqlExamples).forEach(([table, sql]) => {
    console.log(`📋 ${table.toUpperCase()} Table:`);
    console.log(sql);
    console.log('');
  });
}

// Method 3: JSON Data Upload
function generateJSONFormat() {
  console.log('📋 Method 3: JSON Data Upload\n');
  
  const jsonExample = {
    serial_master: [
      {
        "serial_number": "SARI001",
        "entry_date": "2024-01-15",
        "design_code": "DESIGN001", 
        "current_process": "Kora",
        "current_location": "Production Floor A",
        "current_code": "KORA001",
        "is_rejected": false
      },
      {
        "serial_number": "SARI002",
        "entry_date": "2024-01-16",
        "design_code": "DESIGN002",
        "current_process": "White", 
        "current_location": "Production Floor B",
        "current_code": "WHITE002",
        "is_rejected": false
      }
    ],
    item_master: [
      {
        "design_code": "DESIGN001",
        "kora_code": "KORA001",
        "white_code": "WHITE001", 
        "self_code": "SELF001",
        "contrast_code": "CONTRAST001"
      }
    ],
    movement_log: [
      {
        "serial_number": "SARI001",
        "movement_date": "2024-01-15 10:00:00",
        "from_process": "Entry",
        "to_process": "Kora",
        "location": "Production Floor A"
      }
    ],
    customers: [
      {
        "name": "Raj Textiles",
        "email": "raj@textiles.com",
        "phone": "+91-9876543210",
        "address": "123 Textile Market",
        "city": "Mumbai",
        "state": "Maharashtra", 
        "pincode": "400001"
      }
    ],
    suppliers: [
      {
        "name": "Fabric Supplier",
        "email": "fabric@supplier.com",
        "phone": "+91-9876543220",
        "address": "789 Supply Chain",
        "city": "Mumbai",
        "state": "Maharashtra",
        "pincode": "400002",
        "category": "Fabric"
      }
    ]
  };
  
  console.log('📄 Create JSON files with this structure:');
  console.log(JSON.stringify(jsonExample, null, 2));
}

// Method 4: Excel Export Query Generator
function generateExcelExportQueries() {
  console.log('\n📊 Method 4: Excel Export Queries\n');
  
  const exportQueries = {
    complete_inventory: `
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
ORDER BY sm.entry_date DESC;`,

    movement_history: `
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
ORDER BY ml.movement_date DESC;`,

    production_summary: `
-- Production Summary Report (for Excel export)
SELECT 
    current_process,
    COUNT(*) as total_count,
    SUM(CASE WHEN is_rejected THEN 1 ELSE 0 END) as rejected_count,
    SUM(CASE WHEN is_rejected THEN 0 ELSE 1 END) as active_count
FROM serial_master
GROUP BY current_process
ORDER BY total_count DESC;`,

    customer_supplier_report: `
-- Customer & Supplier Report (for Excel export)
SELECT 
    'Customer' as type,
    name,
    email,
    phone,
    city,
    state,
    NULL as category
FROM customers
UNION ALL
SELECT 
    'Supplier' as type,
    name,
    email,
    phone,
    city,
    state,
    category
FROM suppliers
ORDER BY type, name;`
  };
  
  Object.entries(exportQueries).forEach(([report, query]) => {
    console.log(`📊 ${report.replace(/_/g, ' ').toUpperCase()} QUERY:`);
    console.log(query);
    console.log('');
  });
}

// Main execution
async function main() {
  await uploadRealData();
  generateSQLInserts();
  generateJSONFormat();
  generateExcelExportQueries();
  
  console.log('\n🎯 NEXT STEPS:');
  console.log('1. Choose your preferred upload method above');
  console.log('2. Prepare your data in the specified format');
  console.log('3. Use the generated queries in pgAdmin');
  console.log('4. Export data using the Excel queries provided');
  console.log('\n💡 TIP: Start with CSV upload method for easiest data import!');
}

main().catch(console.error);
