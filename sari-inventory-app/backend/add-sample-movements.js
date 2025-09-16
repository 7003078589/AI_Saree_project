const { pool } = require('./config/database');

async function addSampleMovements() {
  try {
    console.log('🚀 Adding sample movement logs to your database...\n');
    
    // Add sample movement logs
    const movements = [
      {
        serial_number: 'SARI001',
        from_process: 'Kora',
        to_process: 'White',
        location: 'Test Location'
      },
      {
        serial_number: 'SARI002',
        from_process: 'Kora',
        to_process: 'White',
        location: 'Location B'
      },
      {
        serial_number: 'SARI003',
        from_process: 'White',
        to_process: 'Self',
        location: 'Location C'
      }
    ];

    for (const movement of movements) {
      const query = `
        INSERT INTO movement_log (serial_number, movement_date, from_process, to_process, location)
        VALUES ($1, NOW() - INTERVAL '${Math.floor(Math.random() * 24)} hours', $2, $3, $4)
        RETURNING *
      `;
      
      const result = await pool.query(query, [
        movement.serial_number,
        movement.from_process,
        movement.to_process,
        movement.location
      ]);
      
      console.log(`✅ Added movement: ${movement.serial_number} from ${movement.from_process} to ${movement.to_process}`);
    }
    
    // Update serial_master to reflect the new processes
    const updateQueries = [
      "UPDATE serial_master SET current_process = 'White', current_location = 'Test Location', current_code = 'WHITE001' WHERE serial_number = 'SARI001'",
      "UPDATE serial_master SET current_process = 'White', current_location = 'Location B', current_code = 'WHITE002' WHERE serial_number = 'SARI002'",
      "UPDATE serial_master SET current_process = 'Self', current_location = 'Location C', current_code = 'SELF003' WHERE serial_number = 'SARI003'"
    ];
    
    for (const updateQuery of updateQueries) {
      await pool.query(updateQuery);
    }
    
    console.log('\n✅ Sample movements added successfully!');
    console.log('📊 Your dashboard will now show:');
    console.log('   - 3 total movements');
    console.log('   - 3 different locations');
    console.log('   - 3 saris tracked through production');
    
    // Show current data
    const movementCount = await pool.query('SELECT COUNT(*) as count FROM movement_log');
    const sariCount = await pool.query('SELECT COUNT(*) as count FROM serial_master');
    
    console.log(`\n📈 Current Database Status:`);
    console.log(`   - Total Movements: ${movementCount.rows[0].count}`);
    console.log(`   - Total Saris: ${sariCount.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Error adding sample movements:', error.message);
  } finally {
    await pool.end();
  }
}

addSampleMovements();
