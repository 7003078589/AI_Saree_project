const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
require('dotenv').config({ path: './config.env' });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'MH Factory Sari-Tracking',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Aman@589',
});

async function importData() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting data import...');
    
    const exportsDir = path.join(__dirname, 'exports');
    
    if (!fs.existsSync(exportsDir)) {
      console.log('❌ Exports directory not found. Please run export-data.js first.');
      return;
    }
    
    // Check if files exist
    const files = {
      serial: path.join(exportsDir, 'serial_master_export.csv'),
      movement: path.join(exportsDir, 'movement_log_export.csv'),
      item: path.join(exportsDir, 'item_master_export.csv')
    };
    
    // Import serial_master
    if (fs.existsSync(files.serial)) {
      console.log('📊 Importing serial_master...');
      await importCSV(client, files.serial, 'serial_master');
    }
    
    // Import movement_log
    if (fs.existsSync(files.movement)) {
      console.log('📦 Importing movement_log...');
      await importCSV(client, files.movement, 'movement_log');
    }
    
    // Import item_master
    if (fs.existsSync(files.item)) {
      console.log('🏷️ Importing item_master...');
      await importCSV(client, files.item, 'item_master');
    }
    
    console.log('\n🎉 Import completed successfully!');
    
  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

async function importCSV(client, filePath, tableName) {
  return new Promise((resolve, reject) => {
    const rows = [];
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        rows.push(row);
      })
      .on('end', async () => {
        try {
          console.log(`📥 Processing ${rows.length} rows for ${tableName}...`);
          
          // Clear existing data
          await client.query(`DELETE FROM ${tableName}`);
          
          // Insert new data in batches
          const batchSize = 100;
          for (let i = 0; i < rows.length; i += batchSize) {
            const batch = rows.slice(i, i + batchSize);
            await insertBatch(client, tableName, batch);
            console.log(`✅ Imported batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(rows.length/batchSize)}`);
          }
          
          console.log(`✅ Imported ${rows.length} records to ${tableName}`);
          resolve();
        } catch (error) {
          reject(error);
        }
      })
      .on('error', reject);
  });
}

async function insertBatch(client, tableName, batch) {
  if (batch.length === 0) return;
  
  const columns = Object.keys(batch[0]);
  const placeholders = batch.map((_, index) => {
    const rowPlaceholders = columns.map((_, colIndex) => 
      `$${index * columns.length + colIndex + 1}`
    ).join(', ');
    return `(${rowPlaceholders})`;
  }).join(', ');
  
  const query = `
    INSERT INTO ${tableName} (${columns.join(', ')})
    VALUES ${placeholders}
    ON CONFLICT (id) DO UPDATE SET
    ${columns.filter(col => col !== 'id').map(col => `${col} = EXCLUDED.${col}`).join(', ')}
  `;
  
  const values = batch.flatMap(row => 
    columns.map(col => {
      const value = row[col];
      if (value === '' || value === 'NULL') return null;
      if (col.includes('date') || col.includes('_at')) {
        return value ? new Date(value) : null;
      }
      if (col.includes('number') || col.includes('count')) {
        return value ? parseInt(value) : null;
      }
      return value;
    })
  );
  
  await client.query(query, values);
}

// Run import
importData();
