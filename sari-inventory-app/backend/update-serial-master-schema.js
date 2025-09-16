const { pool } = require('./config/database');

async function updateSerialMasterSchema() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Updating serial_master schema to match your real data structure...');
    
    // Add missing columns to serial_master table
    console.log('⏳ Adding missing columns to serial_master...');
    
    await client.query('ALTER TABLE serial_master ADD COLUMN IF NOT EXISTS latest_core_date DATE');
    await client.query('ALTER TABLE serial_master ADD COLUMN IF NOT EXISTS latest_any_key TEXT');
    await client.query('ALTER TABLE serial_master ADD COLUMN IF NOT EXISTS latest_core_key TEXT');
    
    console.log('✅ Missing columns added to serial_master');
    
    // Verify the updated structure
    console.log('\n🔍 Verifying updated serial_master structure...');
    
    const columns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'serial_master' 
      ORDER BY ordinal_position
    `);
    
    console.log('📊 Updated serial_master columns:');
    columns.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });
    
    console.log('\n🎉 Serial master schema update completed successfully!');
    
  } catch (error) {
    console.error('❌ Error updating serial_master schema:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the update
updateSerialMasterSchema()
  .then(() => {
    console.log('\n✅ Serial master schema update completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Serial master schema update failed:', error);
    process.exit(1);
  });
