const { pool } = require('./config/database');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

// Function to convert date from DD/MM/YYYY to YYYY-MM-DD
function convertDate(dateStr) {
  if (!dateStr || dateStr.trim() === '') return null;
  
  try {
    // Handle DD/MM/YYYY format
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0]);
      const month = parseInt(parts[1]);
      const year = parseInt(parts[2]);
      
      // Validate date components
      if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900 && year <= 2100) {
        const dayStr = day.toString().padStart(2, '0');
        const monthStr = month.toString().padStart(2, '0');
        const yearStr = year.toString();
        return `${yearStr}-${monthStr}-${dayStr}`;
      }
    }
    
    // Handle MM-DD-YYYY format (if any)
    const dashParts = dateStr.split('-');
    if (dashParts.length === 3) {
      const month = parseInt(dashParts[0]);
      const day = parseInt(dashParts[1]);
      const year = parseInt(dashParts[2]);
      
      if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900 && year <= 2100) {
        const dayStr = day.toString().padStart(2, '0');
        const monthStr = month.toString().padStart(2, '0');
        const yearStr = year.toString();
        return `${yearStr}-${monthStr}-${dayStr}`;
      }
    }
    
    // If all else fails, return a default date for invalid dates
    return '2025-06-13'; // Default date for invalid entries
  } catch (error) {
    return '2025-06-13'; // Default date for error cases
  }
}

async function uploadRealSerialData() {
  const client = await pool.connect();
  
  try {
    console.log('📁 Starting real serial master data upload...\n');
    
    // Clear existing sample data
    console.log('🗑️  Clearing existing sample data...');
    await client.query('DELETE FROM movement_log');
    await client.query('DELETE FROM serial_master');
    await client.query('DELETE FROM item_master');
    console.log('✅ Sample data cleared');
    
    // Upload real serial master data
    console.log('⏳ Uploading real serial master data from "Saree Tracker(Serial Master).csv"...');
    const serialMasterPath = path.join(__dirname, 'Saree Tracker(Serial Master).csv');
    
    if (!fs.existsSync(serialMasterPath)) {
      throw new Error('Saree Tracker(Serial Master).csv file not found!');
    }
    
    const serialMasterData = [];
    
    await new Promise((resolve, reject) => {
      fs.createReadStream(serialMasterPath)
        .pipe(csv())
        .on('data', (row) => {
          // Map your real CSV columns to database structure
          serialMasterData.push({
            numbr: parseInt(row.Numbr) || 0,
            serial_number: row['Serial Number'],
            item_code: row['Item Code'],
            entry_date: convertDate(row['Entry Date']),
            batch_number: parseInt(row['Batch Number']) || null,
            current_process: row['Current Process'],
            current_code: row['Current Code'],
            latest_movement_dt: row['Latest Movement dt'] || 'No Movement',
            current_location: row['Current Location'] || ''
          });
        })
        .on('end', resolve)
        .on('error', reject);
    });
    
    console.log(`📊 Found ${serialMasterData.length} records in your real data`);
    
    // Insert real serial master data
    for (const serial of serialMasterData) {
      await client.query(
        'INSERT INTO serial_master (numbr, serial_number, item_code, entry_date, batch_number, current_process, current_code, latest_movement_dt, current_location) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
        [serial.numbr, serial.serial_number, serial.item_code, serial.entry_date, serial.batch_number, serial.current_process, serial.current_code, serial.latest_movement_dt, serial.current_location]
      );
    }
    
    console.log(`✅ Uploaded ${serialMasterData.length} real serial master records`);
    
    // Create item_master entries from unique item codes in serial_master
    console.log('⏳ Creating item_master entries from serial master data...');
    
    const uniqueItemCodes = await client.query(`
      SELECT DISTINCT item_code, current_process 
      FROM serial_master 
      WHERE item_code IS NOT NULL AND item_code != ''
      ORDER BY item_code
    `);
    
    for (const item of uniqueItemCodes.rows) {
      const itemCode = item.item_code;
      const process = item.current_process;
      
      // Create process-specific codes
      const kora = `Kora ${itemCode}`;
      const white = `White ${itemCode}`;
      const self = `Self ${itemCode}`;
      const contrast = `Contrast ${itemCode}`;
      
      await client.query(
        'INSERT INTO item_master (item_code, kora, white, self, contrast) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (item_code) DO NOTHING',
        [itemCode, kora, white, self, contrast]
      );
    }
    
    console.log(`✅ Created ${uniqueItemCodes.rows.length} item_master entries`);
    
    // Verify upload results
    console.log('\n🔍 Verifying upload results...');
    
    const serialCount = await client.query('SELECT COUNT(*) FROM serial_master');
    const itemCount = await client.query('SELECT COUNT(*) FROM item_master');
    const movementCount = await client.query('SELECT COUNT(*) FROM movement_log');
    
    console.log('\n📈 Final record counts:');
    console.log(`   - serial_master: ${serialCount.rows[0].count} records`);
    console.log(`   - item_master: ${itemCount.rows[0].count} records`);
    console.log(`   - movement_log: ${movementCount.rows[0].count} records`);
    
    // Show sample data from different processes
    console.log('\n📋 Sample data by process:');
    
    const processStats = await client.query(`
      SELECT current_process, COUNT(*) as count 
      FROM serial_master 
      WHERE current_process IS NOT NULL 
      GROUP BY current_process 
      ORDER BY count DESC
    `);
    
    processStats.rows.forEach(stat => {
      console.log(`   - ${stat.current_process}: ${stat.count} items`);
    });
    
    // Show sample data
    console.log('\n📋 Sample serial master data:');
    const sampleData = await client.query('SELECT * FROM serial_master LIMIT 5');
    sampleData.rows.forEach((row, index) => {
      console.log(`   Row ${index + 1}:`, {
        numbr: row.numbr,
        serial_number: row.serial_number,
        item_code: row.item_code,
        entry_date: row.entry_date,
        batch_number: row.batch_number,
        current_process: row.current_process,
        current_code: row.current_code,
        latest_movement_dt: row.latest_movement_dt,
        current_location: row.current_location
      });
    });
    
    console.log('\n🎉 Real serial master data upload completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during real data upload:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the upload
uploadRealSerialData()
  .then(() => {
    console.log('\n✅ Real serial master data upload completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Real serial master data upload failed:', error);
    process.exit(1);
  });
