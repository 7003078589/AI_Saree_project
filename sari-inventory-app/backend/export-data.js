const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: './config.env' });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'MH Factory Sari-Tracking',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Aman@589',
});

async function exportData() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting data export...');
    
    // Create exports directory
    const exportsDir = path.join(__dirname, 'exports');
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir);
    }
    
    // Export serial_master
    console.log('📊 Exporting serial_master...');
    const serialResult = await client.query('SELECT * FROM serial_master ORDER BY serial_number');
    const serialCsv = convertToCSV(serialResult.rows, [
      'id', 'numbr', 'serial_number', 'item_code', 'entry_date', 
      'batch_number', 'current_process', 'current_code', 
      'latest_movement_dt', 'current_location', 'created_at', 'updated_at'
    ]);
    fs.writeFileSync(path.join(exportsDir, 'serial_master_export.csv'), serialCsv);
    console.log(`✅ Exported ${serialResult.rows.length} serial records`);
    
    // Export movement_log
    console.log('📦 Exporting movement_log...');
    const movementResult = await client.query('SELECT * FROM movement_log ORDER BY created_at');
    const movementCsv = convertToCSV(movementResult.rows, [
      'id', 'serial_number', 'item_code', 'movement_date', 'done_to_process',
      'from_process', 'body_colour', 'border_colour', 'from_location',
      'to_location', 'quality', 'document_number', 'notes', 'created_at'
    ]);
    fs.writeFileSync(path.join(exportsDir, 'movement_log_export.csv'), movementCsv);
    console.log(`✅ Exported ${movementResult.rows.length} movement records`);
    
    // Export item_master
    console.log('🏷️ Exporting item_master...');
    const itemResult = await client.query('SELECT * FROM item_master ORDER BY item_code');
    const itemCsv = convertToCSV(itemResult.rows, [
      'id', 'item_code', 'kora', 'white', 'self', 'contrast', 'created_at', 'updated_at'
    ]);
    fs.writeFileSync(path.join(exportsDir, 'item_master_export.csv'), itemCsv);
    console.log(`✅ Exported ${itemResult.rows.length} item records`);
    
    // Create SQL backup
    console.log('💾 Creating SQL backup...');
    const sqlBackup = await createSQLBackup(client);
    fs.writeFileSync(path.join(exportsDir, 'database_backup.sql'), sqlBackup);
    console.log('✅ Created SQL backup');
    
    // Create summary
    const summary = {
      export_date: new Date().toISOString(),
      serial_master_count: serialResult.rows.length,
      movement_log_count: movementResult.rows.length,
      item_master_count: itemResult.rows.length,
      files: [
        'serial_master_export.csv',
        'movement_log_export.csv', 
        'item_master_export.csv',
        'database_backup.sql'
      ]
    };
    
    fs.writeFileSync(path.join(exportsDir, 'export_summary.json'), JSON.stringify(summary, null, 2));
    
    console.log('\n🎉 Export completed successfully!');
    console.log(`📁 Files saved in: ${exportsDir}`);
    console.log('\n📋 Export Summary:');
    console.log(`• Serial Master: ${serialResult.rows.length} records`);
    console.log(`• Movement Log: ${movementResult.rows.length} records`);
    console.log(`• Item Master: ${itemResult.rows.length} records`);
    console.log(`• SQL Backup: Complete database backup`);
    
  } catch (error) {
    console.error('❌ Export failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

function convertToCSV(data, headers) {
  if (data.length === 0) return headers.join(',') + '\n';
  
  const csvRows = [headers.join(',')];
  
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      if (value === null || value === undefined) return '';
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
}

async function createSQLBackup(client) {
  const tables = ['serial_master', 'movement_log', 'item_master', 'customers', 'suppliers'];
  let sql = '-- AI Sari Tracking Database Backup\n';
  sql += `-- Generated on: ${new Date().toISOString()}\n\n`;
  
  for (const table of tables) {
    try {
      const result = await client.query(`SELECT * FROM ${table}`);
      if (result.rows.length > 0) {
        sql += `-- Table: ${table}\n`;
        sql += `DELETE FROM ${table};\n`;
        
        for (const row of result.rows) {
          const columns = Object.keys(row);
          const values = columns.map(col => {
            const value = row[col];
            if (value === null) return 'NULL';
            if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
            return value;
          });
          
          sql += `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${values.join(', ')});\n`;
        }
        sql += '\n';
      }
    } catch (error) {
      console.log(`⚠️ Skipping table ${table}: ${error.message}`);
    }
  }
  
  return sql;
}

// Run export
exportData();
