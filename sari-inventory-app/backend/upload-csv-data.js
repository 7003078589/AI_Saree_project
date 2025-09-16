const { pool } = require('./config/database');
const fs = require('fs');
const path = require('path');

// 📊 CSV DATA UPLOAD SCRIPT
// This script reads CSV files and uploads data to your PostgreSQL database

async function parseCSV(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      throw new Error('CSV file must have at least a header and one data row');
    }
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      if (values.length === headers.length) {
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index];
        });
        data.push(row);
      }
    }
    
    return { headers, data };
  } catch (error) {
    console.error(`❌ Error parsing CSV file ${filePath}:`, error.message);
    return null;
  }
}

async function uploadSerialMasterData(data) {
  console.log(`📤 Uploading ${data.length} records to serial_master...`);
  
  for (const row of data) {
    try {
      const query = `
        INSERT INTO serial_master (serial_number, entry_date, design_code, current_process, current_location, current_code, is_rejected)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (serial_number) DO UPDATE SET
          entry_date = EXCLUDED.entry_date,
          design_code = EXCLUDED.design_code,
          current_process = EXCLUDED.current_process,
          current_location = EXCLUDED.current_location,
          current_code = EXCLUDED.current_code,
          is_rejected = EXCLUDED.is_rejected
        RETURNING serial_number
      `;
      
      const values = [
        row.serial_number,
        row.entry_date,
        row.design_code,
        row.current_process || null,
        row.current_location || null,
        row.current_code || null,
        row.is_rejected === 'true' || row.is_rejected === true
      ];
      
      const result = await pool.query(query, values);
      console.log(`✅ Uploaded: ${result.rows[0].serial_number}`);
      
    } catch (error) {
      console.error(`❌ Error uploading ${row.serial_number}:`, error.message);
    }
  }
}

async function uploadItemMasterData(data) {
  console.log(`📤 Uploading ${data.length} records to item_master...`);
  
  for (const row of data) {
    try {
      const query = `
        INSERT INTO item_master (design_code, kora_code, white_code, self_code, contrast_code)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (design_code) DO UPDATE SET
          kora_code = EXCLUDED.kora_code,
          white_code = EXCLUDED.white_code,
          self_code = EXCLUDED.self_code,
          contrast_code = EXCLUDED.contrast_code
        RETURNING design_code
      `;
      
      const values = [
        row.design_code,
        row.kora_code || null,
        row.white_code || null,
        row.self_code || null,
        row.contrast_code || null
      ];
      
      const result = await pool.query(query, values);
      console.log(`✅ Uploaded: ${result.rows[0].design_code}`);
      
    } catch (error) {
      console.error(`❌ Error uploading ${row.design_code}:`, error.message);
    }
  }
}

async function uploadMovementLogData(data) {
  console.log(`📤 Uploading ${data.length} records to movement_log...`);
  
  for (const row of data) {
    try {
      const query = `
        INSERT INTO movement_log (serial_number, movement_date, from_process, to_process, location)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING movement_id
      `;
      
      const values = [
        row.serial_number,
        row.movement_date,
        row.from_process,
        row.to_process,
        row.location
      ];
      
      const result = await pool.query(query, values);
      console.log(`✅ Uploaded movement: ${row.serial_number} (ID: ${result.rows[0].movement_id})`);
      
    } catch (error) {
      console.error(`❌ Error uploading movement for ${row.serial_number}:`, error.message);
    }
  }
}

async function uploadCustomersData(data) {
  console.log(`📤 Uploading ${data.length} records to customers...`);
  
  for (const row of data) {
    try {
      const query = `
        INSERT INTO customers (name, email, phone, address, city, state, pincode, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING customer_id
      `;
      
      const values = [
        row.name,
        row.email || null,
        row.phone || null,
        row.address || null,
        row.city || null,
        row.state || null,
        row.pincode || null,
        row.status || 'active'
      ];
      
      const result = await pool.query(query, values);
      console.log(`✅ Uploaded customer: ${row.name} (ID: ${result.rows[0].customer_id})`);
      
    } catch (error) {
      console.error(`❌ Error uploading customer ${row.name}:`, error.message);
    }
  }
}

async function uploadSuppliersData(data) {
  console.log(`📤 Uploading ${data.length} records to suppliers...`);
  
  for (const row of data) {
    try {
      const query = `
        INSERT INTO suppliers (name, email, phone, address, city, state, pincode, category, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING supplier_id
      `;
      
      const values = [
        row.name,
        row.email || null,
        row.phone || null,
        row.address || null,
        row.city || null,
        row.state || null,
        row.pincode || null,
        row.category || 'general',
        row.status || 'active'
      ];
      
      const result = await pool.query(query, values);
      console.log(`✅ Uploaded supplier: ${row.name} (ID: ${result.rows[0].supplier_id})`);
      
    } catch (error) {
      console.error(`❌ Error uploading supplier ${row.name}:`, error.message);
    }
  }
}

async function uploadCSVData() {
  try {
    console.log('🚀 Starting CSV Data Upload Process...\n');
    
    const csvFiles = {
      'serial_master.csv': uploadSerialMasterData,
      'item_master.csv': uploadItemMasterData,
      'movement_log.csv': uploadMovementLogData,
      'customers.csv': uploadCustomersData,
      'suppliers.csv': uploadSuppliersData
    };
    
    let totalUploaded = 0;
    
    for (const [filename, uploadFunction] of Object.entries(csvFiles)) {
      if (fs.existsSync(filename)) {
        console.log(`\n📁 Processing ${filename}...`);
        
        const parsed = await parseCSV(filename);
        if (parsed && parsed.data.length > 0) {
          await uploadFunction(parsed.data);
          totalUploaded += parsed.data.length;
          console.log(`✅ Completed ${filename}: ${parsed.data.length} records`);
        } else {
          console.log(`❌ No valid data found in ${filename}`);
        }
      } else {
        console.log(`⚠️  File not found: ${filename}`);
      }
    }
    
    console.log(`\n🎉 Upload Complete! Total records uploaded: ${totalUploaded}`);
    
    // Show summary statistics
    const stats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM serial_master) as serial_count,
        (SELECT COUNT(*) FROM item_master) as item_count,
        (SELECT COUNT(*) FROM movement_log) as movement_count,
        (SELECT COUNT(*) FROM customers) as customer_count,
        (SELECT COUNT(*) FROM suppliers) as supplier_count
    `);
    
    console.log('\n📊 Current Database Statistics:');
    console.log(`   - Serial Master: ${stats.rows[0].serial_count} records`);
    console.log(`   - Item Master: ${stats.rows[0].item_count} records`);
    console.log(`   - Movement Log: ${stats.rows[0].movement_count} records`);
    console.log(`   - Customers: ${stats.rows[0].customer_count} records`);
    console.log(`   - Suppliers: ${stats.rows[0].supplier_count} records`);
    
  } catch (error) {
    console.error('❌ Error in CSV upload process:', error.message);
  } finally {
    await pool.end();
  }
}

// Create sample CSV files if they don't exist
function createSampleCSVFiles() {
  console.log('📝 Creating sample CSV files...\n');
  
  const sampleFiles = {
    'serial_master.csv': `serial_number,entry_date,design_code,current_process,current_location,current_code,is_rejected
SARI001,2024-01-15,DESIGN001,Kora,Production Floor A,KORA001,false
SARI002,2024-01-16,DESIGN002,White,Production Floor B,WHITE002,false
SARI003,2024-01-17,DESIGN003,Self,Production Floor C,SELF003,false`,

    'item_master.csv': `design_code,kora_code,white_code,self_code,contrast_code
DESIGN001,KORA001,WHITE001,SELF001,CONTRAST001
DESIGN002,KORA002,WHITE002,SELF002,CONTRAST002
DESIGN003,KORA003,WHITE003,SELF003,CONTRAST003`,

    'movement_log.csv': `serial_number,movement_date,from_process,to_process,location
SARI001,2024-01-15 10:00:00,Entry,Kora,Production Floor A
SARI001,2024-01-15 14:00:00,Kora,White,Production Floor B
SARI002,2024-01-16 09:00:00,Entry,Kora,Production Floor A`,

    'customers.csv': `name,email,phone,address,city,state,pincode
"Raj Textiles","raj@textiles.com","+91-9876543210","123 Textile Market","Mumbai","Maharashtra","400001"
"Delhi Sarees","delhi@sarees.com","+91-9876543211","456 Fashion Street","Delhi","Delhi","110001"`,

    'suppliers.csv': `name,email,phone,address,city,state,pincode,category
"Fabric Supplier","fabric@supplier.com","+91-9876543220","789 Supply Chain","Mumbai","Maharashtra","400002","Fabric"
"Dye Supplier","dye@supplier.com","+91-9876543221","321 Chemical Lane","Delhi","Delhi","110002","Dyes"`
  };
  
  Object.entries(sampleFiles).forEach(([filename, content]) => {
    if (!fs.existsSync(filename)) {
      fs.writeFileSync(filename, content);
      console.log(`✅ Created sample file: ${filename}`);
    } else {
      console.log(`⚠️  File already exists: ${filename}`);
    }
  });
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--create-samples')) {
    createSampleCSVFiles();
    console.log('\n💡 Now edit these CSV files with your real data and run: node upload-csv-data.js');
  } else {
    await uploadCSVData();
  }
}

main().catch(console.error);
