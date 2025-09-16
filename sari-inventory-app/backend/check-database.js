const { pool } = require('./config/database');

async function checkDatabase() {
  try {
    console.log('🔍 Checking your PostgreSQL database...\n');
    
    // 1. Check if we can connect
    console.log('✅ Database connection successful!');
    
    // 2. List all tables
    console.log('\n📋 Available Tables:');
    const tablesResult = await pool.query(`
      SELECT table_name, table_type 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    if (tablesResult.rows.length === 0) {
      console.log('❌ No tables found in the database');
      return;
    }
    
    tablesResult.rows.forEach(table => {
      console.log(`   - ${table.table_name} (${table.table_type})`);
    });
    
    // 3. Check each table for data
    for (const table of tablesResult.rows) {
      const tableName = table.table_name;
      
      // Get table structure
      const structureResult = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = $1 
        ORDER BY ordinal_position
      `, [tableName]);
      
      console.log(`\n📊 Table: ${tableName}`);
      console.log('   Columns:');
      structureResult.rows.forEach(col => {
        const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        const defaultValue = col.column_default ? ` DEFAULT ${col.column_default}` : '';
        console.log(`     - ${col.column_name}: ${col.data_type} ${nullable}${defaultValue}`);
      });
      
      // Get row count
      const countResult = await pool.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
      const rowCount = parseInt(countResult.rows[0].count);
      console.log(`   Row Count: ${rowCount}`);
      
      // Show sample data (first 5 rows)
      if (rowCount > 0) {
        const sampleResult = await pool.query(`SELECT * FROM "${tableName}" LIMIT 5`);
        console.log('   Sample Data:');
        sampleResult.rows.forEach((row, index) => {
          console.log(`     Row ${index + 1}:`, JSON.stringify(row, null, 2));
        });
      } else {
        console.log('   No data in this table');
      }
    }
    
    // 4. Check for triggers
    console.log('\n🔧 Database Triggers:');
    const triggersResult = await pool.query(`
      SELECT trigger_name, event_manipulation, event_object_table, action_statement
      FROM information_schema.triggers 
      WHERE trigger_schema = 'public'
      ORDER BY trigger_name
    `);
    
    if (triggersResult.rows.length === 0) {
      console.log('   No triggers found');
    } else {
      triggersResult.rows.forEach(trigger => {
        console.log(`   - ${trigger.trigger_name} on ${trigger.event_object_table} (${trigger.event_manipulation})`);
        console.log(`     Action: ${trigger.action_statement}`);
      });
    }
    
    // 5. Check for functions
    console.log('\n⚙️ Database Functions:');
    const functionsResult = await pool.query(`
      SELECT routine_name, routine_type, data_type
      FROM information_schema.routines 
      WHERE routine_schema = 'public'
      ORDER BY routine_name
    `);
    
    if (functionsResult.rows.length === 0) {
      console.log('   No functions found');
    } else {
      functionsResult.rows.forEach(func => {
        console.log(`   - ${func.routine_name} (${func.routine_type}) returns ${func.data_type}`);
      });
    }
    
    console.log('\n✅ Database check completed!');
    
  } catch (error) {
    console.error('❌ Error checking database:', error.message);
  } finally {
    await pool.end();
  }
}

checkDatabase();
