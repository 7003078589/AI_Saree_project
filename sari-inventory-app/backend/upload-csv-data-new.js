const { pool } = require('./config/database');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

async function uploadCSVData() {
  const client = await pool.connect();
  
  try {
    console.log('📁 Starting CSV data upload with new database structure...\n');
    
    // Upload item_master data
    console.log('⏳ Uploading item_master data...');
    const itemMasterPath = path.join(__dirname, 'item_master.csv');
    
    if (fs.existsSync(itemMasterPath)) {
      const itemMasterData = [];
      
      await new Promise((resolve, reject) => {
        fs.createReadStream(itemMasterPath)
          .pipe(csv())
          .on('data', (row) => {
            // Map CSV columns to new database structure
            itemMasterData.push({
              item_code: row.design_code || row.item_code,
              kora: row.kora_code || row.kora,
              white: row.white_code || row.white,
              self: row.self_code || row.self,
              contrast: row.contrast_code || row.contrast
            });
          })
          .on('end', resolve)
          .on('error', reject);
      });
      
      // Clear existing data and insert new data
      await client.query('DELETE FROM item_master');
      
      for (const item of itemMasterData) {
        await client.query(
          'INSERT INTO item_master (item_code, kora, white, self, contrast) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (item_code) DO UPDATE SET kora = EXCLUDED.kora, white = EXCLUDED.white, self = EXCLUDED.self, contrast = EXCLUDED.contrast',
          [item.item_code, item.kora, item.white, item.self, item.contrast]
        );
      }
      
      console.log(`✅ Uploaded ${itemMasterData.length} item_master records`);
    } else {
      console.log('⚠️  item_master.csv not found, skipping...');
    }
    
    // Upload serial_master data
    console.log('⏳ Uploading serial_master data...');
    const serialMasterPath = path.join(__dirname, 'serial_master.csv');
    
    if (fs.existsSync(serialMasterPath)) {
      const serialMasterData = [];
      
      await new Promise((resolve, reject) => {
        fs.createReadStream(serialMasterPath)
          .pipe(csv())
          .on('data', (row) => {
            // Map CSV columns to new database structure
            serialMasterData.push({
              numbr: parseInt(row.numbr) || parseInt(row.serial_number?.replace('E', '')) || 0,
              serial_number: row.serial_number,
              item_code: row.design_code || row.item_code,
              entry_date: row.entry_date && row.entry_date.trim() !== '' ? row.entry_date : null,
              batch_number: parseInt(row.batch_number) || null,
              current_process: row.current_process,
              current_code: row.current_code,
              latest_movement_dt: row.latest_movement_dt || 'No Movement',
              current_location: row.current_location || ''
            });
          })
          .on('end', resolve)
          .on('error', reject);
      });
      
      // Clear existing data and insert new data
      await client.query('DELETE FROM serial_master');
      
      for (const serial of serialMasterData) {
        await client.query(
          'INSERT INTO serial_master (numbr, serial_number, item_code, entry_date, batch_number, current_process, current_code, latest_movement_dt, current_location) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (serial_number) DO UPDATE SET numbr = EXCLUDED.numbr, item_code = EXCLUDED.item_code, entry_date = EXCLUDED.entry_date, batch_number = EXCLUDED.batch_number, current_process = EXCLUDED.current_process, current_code = EXCLUDED.current_code, latest_movement_dt = EXCLUDED.latest_movement_dt, current_location = EXCLUDED.current_location',
          [serial.numbr, serial.serial_number, serial.item_code, serial.entry_date, serial.batch_number, serial.current_process, serial.current_code, serial.latest_movement_dt, serial.current_location]
        );
      }
      
      console.log(`✅ Uploaded ${serialMasterData.length} serial_master records`);
    } else {
      console.log('⚠️  serial_master.csv not found, skipping...');
    }
    
    // Upload movement_log data
    console.log('⏳ Uploading movement_log data...');
    const movementLogPath = path.join(__dirname, 'movement_log.csv');
    
    if (fs.existsSync(movementLogPath)) {
      const movementLogData = [];
      
      await new Promise((resolve, reject) => {
        fs.createReadStream(movementLogPath)
          .pipe(csv())
          .on('data', (row) => {
            // Map CSV columns to new database structure
            movementLogData.push({
              serial_number: row.serial_number,
              item_code: row.design_code || row.item_code,
              movement_date: row.movement_date && row.movement_date.trim() !== '' ? row.movement_date : null,
              done_to_process: row.done_to_process || row.to_process || '',
              from_process: row.from_process,
              body_colour: row.body_colour || '',
              border_colour: row.border_colour || '',
              from_location: row.from_location || '',
              to_location: row.to_location || row.location || '',
              quality: row.quality || '',
              document_number: row.document_number || '',
              notes: row.notes || ''
            });
          })
          .on('end', resolve)
          .on('error', reject);
      });
      
      // Clear existing data and insert new data
      await client.query('DELETE FROM movement_log');
      
      for (const movement of movementLogData) {
        await client.query(
          'INSERT INTO movement_log (serial_number, item_code, movement_date, done_to_process, from_process, body_colour, border_colour, from_location, to_location, quality, document_number, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
          [movement.serial_number, movement.item_code, movement.movement_date, movement.done_to_process, movement.from_process, movement.body_colour, movement.border_colour, movement.from_location, movement.to_location, movement.quality, movement.document_number, movement.notes]
        );
      }
      
      console.log(`✅ Uploaded ${movementLogData.length} movement_log records`);
    } else {
      console.log('⚠️  movement_log.csv not found, skipping...');
    }
    
    // Upload customers data
    console.log('⏳ Uploading customers data...');
    const customersPath = path.join(__dirname, 'customers.csv');
    
    if (fs.existsSync(customersPath)) {
      const customersData = [];
      
      await new Promise((resolve, reject) => {
        fs.createReadStream(customersPath)
          .pipe(csv())
          .on('data', (row) => {
            customersData.push({
              name: row.name,
              email: row.email || '',
              phone: row.phone || '',
              address: row.address || '',
              city: row.city || '',
              state: row.state || '',
              pincode: row.pincode || '',
              status: row.status || 'active'
            });
          })
          .on('end', resolve)
          .on('error', reject);
      });
      
      // Clear existing data and insert new data
      await client.query('DELETE FROM customers');
      
      for (const customer of customersData) {
        await client.query(
          'INSERT INTO customers (name, email, phone, address, city, state, pincode, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
          [customer.name, customer.email, customer.phone, customer.address, customer.city, customer.state, customer.pincode, customer.status]
        );
      }
      
      console.log(`✅ Uploaded ${customersData.length} customer records`);
    } else {
      console.log('⚠️  customers.csv not found, skipping...');
    }
    
    // Upload suppliers data
    console.log('⏳ Uploading suppliers data...');
    const suppliersPath = path.join(__dirname, 'suppliers.csv');
    
    if (fs.existsSync(suppliersPath)) {
      const suppliersData = [];
      
      await new Promise((resolve, reject) => {
        fs.createReadStream(suppliersPath)
          .pipe(csv())
          .on('data', (row) => {
            suppliersData.push({
              name: row.name,
              email: row.email || '',
              phone: row.phone || '',
              address: row.address || '',
              city: row.city || '',
              state: row.state || '',
              pincode: row.pincode || '',
              category: row.category || 'general',
              status: row.status || 'active'
            });
          })
          .on('end', resolve)
          .on('error', reject);
      });
      
      // Clear existing data and insert new data
      await client.query('DELETE FROM suppliers');
      
      for (const supplier of suppliersData) {
        await client.query(
          'INSERT INTO suppliers (name, email, phone, address, city, state, pincode, category, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
          [supplier.name, supplier.email, supplier.phone, supplier.address, supplier.city, supplier.state, supplier.pincode, supplier.category, supplier.status]
        );
      }
      
      console.log(`✅ Uploaded ${suppliersData.length} supplier records`);
    } else {
      console.log('⚠️  suppliers.csv not found, skipping...');
    }
    
    // Verify upload results
    console.log('\n🔍 Verifying upload results...');
    
    const serialCount = await client.query('SELECT COUNT(*) FROM serial_master');
    const itemCount = await client.query('SELECT COUNT(*) FROM item_master');
    const movementCount = await client.query('SELECT COUNT(*) FROM movement_log');
    const customerCount = await client.query('SELECT COUNT(*) FROM customers');
    const supplierCount = await client.query('SELECT COUNT(*) FROM suppliers');
    
    console.log('\n📈 Final record counts:');
    console.log(`   - serial_master: ${serialCount.rows[0].count} records`);
    console.log(`   - item_master: ${itemCount.rows[0].count} records`);
    console.log(`   - movement_log: ${movementCount.rows[0].count} records`);
    console.log(`   - customers: ${customerCount.rows[0].count} records`);
    console.log(`   - suppliers: ${supplierCount.rows[0].count} records`);
    
    console.log('\n🎉 CSV data upload completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during CSV upload:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the upload
uploadCSVData()
  .then(() => {
    console.log('\n✅ CSV data upload completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ CSV data upload failed:', error);
    process.exit(1);
  });
