const { pool } = require('./config/database');

async function updateColumnSizes() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Updating column sizes to accommodate longer data...');
    
    // Update item_master table columns to TEXT
    console.log('⏳ Updating item_master table columns...');
    await client.query('ALTER TABLE item_master ALTER COLUMN item_code TYPE TEXT');
    await client.query('ALTER TABLE item_master ALTER COLUMN kora TYPE TEXT');
    await client.query('ALTER TABLE item_master ALTER COLUMN white TYPE TEXT');
    await client.query('ALTER TABLE item_master ALTER COLUMN self TYPE TEXT');
    await client.query('ALTER TABLE item_master ALTER COLUMN contrast TYPE TEXT');
    console.log('✅ item_master columns updated');
    
    // Update serial_master table columns to TEXT
    console.log('⏳ Updating serial_master table columns...');
    await client.query('ALTER TABLE serial_master ALTER COLUMN item_code TYPE TEXT');
    await client.query('ALTER TABLE serial_master ALTER COLUMN current_code TYPE TEXT');
    await client.query('ALTER TABLE serial_master ALTER COLUMN latest_movement_dt TYPE TEXT');
    await client.query('ALTER TABLE serial_master ALTER COLUMN current_location TYPE TEXT');
    console.log('✅ serial_master columns updated');
    
    // Update movement_log table columns to TEXT
    console.log('⏳ Updating movement_log table columns...');
    await client.query('ALTER TABLE movement_log ALTER COLUMN item_code TYPE TEXT');
    await client.query('ALTER TABLE movement_log ALTER COLUMN done_to_process TYPE TEXT');
    await client.query('ALTER TABLE movement_log ALTER COLUMN from_process TYPE TEXT');
    await client.query('ALTER TABLE movement_log ALTER COLUMN body_colour TYPE TEXT');
    await client.query('ALTER TABLE movement_log ALTER COLUMN border_colour TYPE TEXT');
    await client.query('ALTER TABLE movement_log ALTER COLUMN from_location TYPE TEXT');
    await client.query('ALTER TABLE movement_log ALTER COLUMN to_location TYPE TEXT');
    await client.query('ALTER TABLE movement_log ALTER COLUMN quality TYPE TEXT');
    await client.query('ALTER TABLE movement_log ALTER COLUMN document_number TYPE TEXT');
    console.log('✅ movement_log columns updated');
    
    console.log('\n🎉 Column size updates completed successfully!');
    
    // Verify the changes
    console.log('\n🔍 Verifying column changes...');
    
    const itemColumns = await client.query(`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns 
      WHERE table_name = 'item_master' 
      ORDER BY ordinal_position
    `);
    
    console.log('📊 item_master columns:');
    itemColumns.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type}${col.character_maximum_length ? `(${col.character_maximum_length})` : ''}`);
    });
    
    const serialColumns = await client.query(`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns 
      WHERE table_name = 'serial_master' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📊 serial_master columns:');
    serialColumns.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type}${col.character_maximum_length ? `(${col.character_maximum_length})` : ''}`);
    });
    
    const movementColumns = await client.query(`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns 
      WHERE table_name = 'movement_log' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📊 movement_log columns:');
    movementColumns.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type}${col.character_maximum_length ? `(${col.character_maximum_length})` : ''}`);
    });
    
  } catch (error) {
    console.error('❌ Error updating column sizes:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the update
updateColumnSizes()
  .then(() => {
    console.log('\n✅ Column size updates completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Column size updates failed:', error);
    process.exit(1);
  });
