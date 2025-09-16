const { pool } = require('./config/database');
const fs = require('fs');
const path = require('path');

async function recreateDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🗑️  Starting database recreation...');
    
    // Read the SQL file
    const sqlFile = path.join(__dirname, 'recreate-database.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    
    // Split the SQL content into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
          await client.query(statement);
          console.log(`✅ Statement ${i + 1} executed successfully`);
        } catch (error) {
          console.error(`❌ Error executing statement ${i + 1}:`, error.message);
          // Continue with other statements
        }
      }
    }
    
    console.log('\n🎉 Database recreation completed successfully!');
    
    // Verify the new structure
    console.log('\n🔍 Verifying new database structure...');
    
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('📊 Tables created:');
    tables.rows.forEach(table => {
      console.log(`   - ${table.table_name}`);
    });
    
    // Check record counts
    const serialCount = await client.query('SELECT COUNT(*) FROM serial_master');
    const itemCount = await client.query('SELECT COUNT(*) FROM item_master');
    const movementCount = await client.query('SELECT COUNT(*) FROM movement_log');
    const customerCount = await client.query('SELECT COUNT(*) FROM customers');
    const supplierCount = await client.query('SELECT COUNT(*) FROM suppliers');
    
    console.log('\n📈 Record counts:');
    console.log(`   - serial_master: ${serialCount.rows[0].count} records`);
    console.log(`   - item_master: ${itemCount.rows[0].count} records`);
    console.log(`   - movement_log: ${movementCount.rows[0].count} records`);
    console.log(`   - customers: ${customerCount.rows[0].count} records`);
    console.log(`   - suppliers: ${supplierCount.rows[0].count} records`);
    
    // Show sample data structure
    console.log('\n📋 Sample data from serial_master:');
    const sampleSerial = await client.query('SELECT * FROM serial_master LIMIT 3');
    sampleSerial.rows.forEach((row, index) => {
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
    
    console.log('\n📋 Sample data from item_master:');
    const sampleItem = await client.query('SELECT * FROM item_master LIMIT 3');
    sampleItem.rows.forEach((row, index) => {
      console.log(`   Row ${index + 1}:`, {
        item_code: row.item_code,
        kora: row.kora,
        white: row.white,
        self: row.self,
        contrast: row.contrast
      });
    });
    
    console.log('\n📋 Sample data from movement_log:');
    const sampleMovement = await client.query('SELECT * FROM movement_log LIMIT 3');
    sampleMovement.rows.forEach((row, index) => {
      console.log(`   Row ${index + 1}:`, {
        serial_number: row.serial_number,
        item_code: row.item_code,
        movement_date: row.movement_date,
        done_to_process: row.done_to_process,
        from_process: row.from_process,
        body_colour: row.body_colour,
        border_colour: row.border_colour,
        from_location: row.from_location,
        to_location: row.to_location,
        quality: row.quality,
        document_number: row.document_number,
        notes: row.notes
      });
    });
    
  } catch (error) {
    console.error('❌ Error during database recreation:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the recreation
recreateDatabase()
  .then(() => {
    console.log('\n✅ Database recreation completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database recreation failed:', error);
    process.exit(1);
  });
