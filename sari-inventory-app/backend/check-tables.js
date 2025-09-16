const { pool } = require('./config/database');

async function checkTables() {
  try {
    console.log('🔍 Checking your actual database tables...\n');
    
    // Check serial_master table
    console.log('📊 Table: serial_master');
    const serialColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'serial_master' 
      ORDER BY ordinal_position
    `);
    
    console.log('   Columns:');
    serialColumns.rows.forEach(col => {
      console.log(`     - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });
    
    // Check item_master table
    console.log('\n📊 Table: item_master');
    const itemColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'item_master' 
      ORDER BY ordinal_position
    `);
    
    console.log('   Columns:');
    itemColumns.rows.forEach(col => {
      console.log(`     - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });
    
    // Check movement_log table
    console.log('\n📊 Table: movement_log');
    const movementColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'movement_log' 
      ORDER BY ordinal_position
    `);
    
    console.log('   Columns:');
    movementColumns.rows.forEach(col => {
      console.log(`     - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });
    
    // Check if customers and suppliers tables exist
    console.log('\n📊 Checking for additional tables...');
    const allTables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('   All tables in database:');
    allTables.rows.forEach(table => {
      console.log(`     - ${table.table_name}`);
    });
    
    // Show sample data from serial_master
    console.log('\n📋 Sample data from serial_master:');
    const sampleData = await pool.query('SELECT * FROM serial_master LIMIT 3');
    sampleData.rows.forEach((row, index) => {
      console.log(`   Row ${index + 1}:`, JSON.stringify(row, null, 2));
    });
    
    console.log('\n✅ Table structure check completed!');
    
  } catch (error) {
    console.error('❌ Error checking tables:', error.message);
  } finally {
    await pool.end();
  }
}

checkTables();
