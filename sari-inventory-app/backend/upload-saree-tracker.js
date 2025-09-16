const { pool } = require('./config/database');
const fs = require('fs');
const path = require('path');

// 📊 UPLOAD YOUR "Saree Tracker(Serial Master)" CSV FILE
// This script specifically handles your CSV file

async function parseCSV(filePath) {
  try {
    console.log(`📁 Reading file: ${filePath}`);
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      throw new Error('CSV file must have at least a header and one data row');
    }
    
    console.log(`📊 Found ${lines.length - 1} data rows (excluding header)`);
    
    // Parse CSV with better handling for quoted fields
    const headers = [];
    const headerLine = lines[0];
    let currentHeader = '';
    let inQuotes = false;
    
    for (let i = 0; i < headerLine.length; i++) {
      const char = headerLine[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        headers.push(currentHeader.trim());
        currentHeader = '';
      } else {
        currentHeader += char;
      }
    }
    headers.push(currentHeader.trim());
    
    console.log('📋 CSV Headers found:', headers);
    
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = [];
      let currentValue = '';
      let inQuotes = false;
      
      for (let j = 0; j < lines[i].length; j++) {
        const char = lines[i][j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(currentValue.trim());
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      values.push(currentValue.trim());
      
      if (values.length === headers.length) {
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || null;
        });
        data.push(row);
      } else {
        console.log(`⚠️  Skipping row ${i + 1}: Expected ${headers.length} columns, got ${values.length}`);
      }
    }
    
    console.log(`✅ Successfully parsed ${data.length} valid rows`);
    return { headers, data };
    
  } catch (error) {
    console.error(`❌ Error parsing CSV file ${filePath}:`, error.message);
    return null;
  }
}

async function mapCSVToDatabase(csvData) {
  console.log('\n🔄 Mapping CSV data to database format...');
  
  // Show what columns we found in your CSV
  console.log('📋 Your CSV columns:', Object.keys(csvData.data[0] || {}));
  
  // Common column mappings for Serial Master
  const columnMappings = {
    // Possible serial number columns
    'serial_number': ['Serial Number', 'Serial No', 'Serial', 'Sari Number', 'Saree Number', 'ID', 'Serial_ID'],
    // Possible entry date columns
    'entry_date': ['Entry Date', 'Date', 'Created Date', 'Production Date', 'Start Date'],
    // Possible design code columns
    'design_code': ['Design Code', 'Design', 'Code', 'Design ID', 'Pattern Code'],
    // Possible process columns
    'current_process': ['Current Process', 'Process', 'Stage', 'Status', 'Current Stage'],
    // Possible location columns
    'current_location': ['Location', 'Current Location', 'Floor', 'Department', 'Area'],
    // Possible code columns
    'current_code': ['Current Code', 'Code', 'Item Code', 'Process Code'],
    // Possible rejection columns
    'is_rejected': ['Rejected', 'Is Rejected', 'Status', 'Quality Status']
  };
  
  // Find matching columns
  const mappedData = [];
  
  for (const row of csvData.data) {
    const mappedRow = {};
    
    // Try to map each database column
    for (const [dbColumn, possibleNames] of Object.entries(columnMappings)) {
      let found = false;
      
      for (const possibleName of possibleNames) {
        if (row[possibleName] !== undefined) {
          mappedRow[dbColumn] = row[possibleName];
          found = true;
          break;
        }
      }
      
      if (!found) {
        // Set default values for missing columns
        switch (dbColumn) {
          case 'is_rejected':
            mappedRow[dbColumn] = false;
            break;
          case 'current_process':
            mappedRow[dbColumn] = 'Kora'; // Default starting process
            break;
          case 'current_location':
            mappedRow[dbColumn] = 'Production Floor';
            break;
          default:
            mappedRow[dbColumn] = null;
        }
      }
    }
    
    // Generate serial number if not found
    if (!mappedRow.serial_number && csvData.data.indexOf(row) !== -1) {
      const index = csvData.data.indexOf(row) + 1;
      mappedRow.serial_number = `SARI${index.toString().padStart(3, '0')}`;
    }
    
    // Generate entry date if not found
    if (!mappedRow.entry_date) {
      mappedRow.entry_date = new Date().toISOString().split('T')[0];
    }
    
    // Generate design code if not found
    if (!mappedRow.design_code) {
      mappedRow.design_code = `DESIGN${(csvData.data.indexOf(row) + 1).toString().padStart(3, '0')}`;
    }
    
    mappedData.push(mappedRow);
  }
  
  console.log(`✅ Mapped ${mappedData.length} rows to database format`);
  return mappedData;
}

async function uploadToSerialMaster(data) {
  console.log(`\n📤 Uploading ${data.length} records to serial_master table...`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const row of data) {
    try {
      // Convert boolean values
      const isRejected = row.is_rejected === 'true' || row.is_rejected === true || row.is_rejected === 'Rejected' || row.is_rejected === 'Yes';
      
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
        row.current_process,
        row.current_location,
        row.current_code,
        isRejected
      ];
      
      const result = await pool.query(query, values);
      console.log(`✅ Uploaded: ${result.rows[0].serial_number}`);
      successCount++;
      
    } catch (error) {
      console.error(`❌ Error uploading ${row.serial_number}:`, error.message);
      errorCount++;
    }
  }
  
  console.log(`\n📊 Upload Summary:`);
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   📈 Total: ${data.length}`);
}

async function createItemMasterEntries(data) {
  console.log(`\n🏭 Creating item_master entries for design codes...`);
  
  // Get unique design codes
  const uniqueDesignCodes = [...new Set(data.map(row => row.design_code))];
  console.log(`📋 Found ${uniqueDesignCodes.length} unique design codes`);
  
  for (const designCode of uniqueDesignCodes) {
    try {
      const query = `
        INSERT INTO item_master (design_code, kora_code, white_code, self_code, contrast_code)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (design_code) DO NOTHING
        RETURNING design_code
      `;
      
      const values = [
        designCode,
        `${designCode}_KORA`,
        `${designCode}_WHITE`,
        `${designCode}_SELF`,
        `${designCode}_CONTRAST`
      ];
      
      const result = await pool.query(query, values);
      if (result.rows.length > 0) {
        console.log(`✅ Created item_master entry: ${result.rows[0].design_code}`);
      } else {
        console.log(`⚠️  Item already exists: ${designCode}`);
      }
      
    } catch (error) {
      console.error(`❌ Error creating item_master entry for ${designCode}:`, error.message);
    }
  }
}

async function showDatabaseStats() {
  console.log('\n📊 Current Database Statistics:');
  
  try {
    const stats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM serial_master) as serial_count,
        (SELECT COUNT(*) FROM item_master) as item_count,
        (SELECT COUNT(*) FROM movement_log) as movement_count
    `);
    
    console.log(`   📦 Serial Master: ${stats.rows[0].serial_count} records`);
    console.log(`   🏭 Item Master: ${stats.rows[0].item_count} records`);
    console.log(`   📋 Movement Log: ${stats.rows[0].movement_count} records`);
    
    // Show sample of uploaded data
    const sampleData = await pool.query('SELECT * FROM serial_master ORDER BY entry_date DESC LIMIT 3');
    console.log('\n📋 Sample of uploaded data:');
    sampleData.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.serial_number} - ${row.design_code} - ${row.current_process}`);
    });
    
  } catch (error) {
    console.error('❌ Error getting database stats:', error.message);
  }
}

async function uploadSareeTracker() {
  try {
    console.log('🚀 Starting Saree Tracker CSV Upload...\n');
    
    // Look for the CSV file
    const possibleFileNames = [
      'Saree Tracker(Serial Master).csv',
      'Saree Tracker(Serial Master)',
      'Saree Tracker (Serial Master).csv',
      'Saree Tracker (Serial Master)'
    ];
    
    let csvFile = null;
    for (const fileName of possibleFileNames) {
      if (fs.existsSync(fileName)) {
        csvFile = fileName;
        break;
      }
    }
    
    if (!csvFile) {
      console.log('❌ CSV file not found! Looking for files with these names:');
      possibleFileNames.forEach(name => console.log(`   - ${name}`));
      
      console.log('\n📁 Files in current directory:');
      const files = fs.readdirSync('.');
      const csvFiles = files.filter(file => file.toLowerCase().endsWith('.csv'));
      csvFiles.forEach(file => console.log(`   - ${file}`));
      
      console.log('\n💡 Please ensure your CSV file is in the backend directory with one of the expected names.');
      return;
    }
    
    console.log(`✅ Found CSV file: ${csvFile}`);
    
    // Parse the CSV
    const csvData = await parseCSV(csvFile);
    if (!csvData) {
      console.log('❌ Failed to parse CSV file');
      return;
    }
    
    // Map CSV data to database format
    const mappedData = await mapCSVToDatabase(csvData);
    
    // Show preview of mapped data
    console.log('\n👀 Preview of mapped data (first 3 rows):');
    mappedData.slice(0, 3).forEach((row, index) => {
      console.log(`   Row ${index + 1}:`, JSON.stringify(row, null, 2));
    });
    
    // Create item_master entries first
    await createItemMasterEntries(mappedData);
    
    // Upload to serial_master
    await uploadToSerialMaster(mappedData);
    
    // Show final statistics
    await showDatabaseStats();
    
    console.log('\n🎉 Upload Complete!');
    console.log('\n💡 Next steps:');
    console.log('   1. Check your dashboard to see the uploaded data');
    console.log('   2. Run: node export-to-excel.js (to export to Excel)');
    console.log('   3. Verify data in pgAdmin if needed');
    
  } catch (error) {
    console.error('❌ Error in upload process:', error.message);
  } finally {
    await pool.end();
  }
}

// Main execution
async function main() {
  await uploadSareeTracker();
}

main().catch(console.error);
