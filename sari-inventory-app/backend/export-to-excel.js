const { pool } = require('./config/database');
const fs = require('fs');

// 📊 EXCEL EXPORT FUNCTIONALITY
// This script exports your database data to CSV files that can be opened in Excel

async function exportToCSV(query, filename, headers = null) {
  try {
    console.log(`📤 Exporting ${filename}...`);
    
    const result = await pool.query(query);
    
    if (result.rows.length === 0) {
      console.log(`⚠️  No data found for ${filename}`);
      return;
    }
    
    // Get headers from first row if not provided
    const csvHeaders = headers || Object.keys(result.rows[0]);
    
    // Create CSV content
    let csvContent = csvHeaders.join(',') + '\n';
    
    result.rows.forEach(row => {
      const values = csvHeaders.map(header => {
        const value = row[header];
        // Handle null values and wrap strings with quotes if they contain commas
        if (value === null || value === undefined) {
          return '';
        }
        const stringValue = String(value);
        return stringValue.includes(',') ? `"${stringValue}"` : stringValue;
      });
      csvContent += values.join(',') + '\n';
    });
    
    // Write to file
    fs.writeFileSync(filename, csvContent);
    console.log(`✅ Exported ${result.rows.length} records to ${filename}`);
    
  } catch (error) {
    console.error(`❌ Error exporting ${filename}:`, error.message);
  }
}

async function exportAllData() {
  try {
    console.log('🚀 Starting Excel Export Process...\n');
    
    // 1. Complete Inventory Report
    await exportToCSV(`
      SELECT 
          sm.serial_number,
          sm.entry_date,
          sm.design_code,
          sm.current_process,
          sm.current_location,
          sm.current_code,
          sm.is_rejected,
          im.kora_code,
          im.white_code,
          im.self_code,
          im.contrast_code,
          CASE 
              WHEN sm.is_rejected THEN 'Rejected'
              ELSE 'Active'
          END as status
      FROM serial_master sm
      LEFT JOIN item_master im ON sm.design_code = im.design_code
      ORDER BY sm.entry_date DESC
    `, 'Complete_Inventory_Report.csv');
    
    // 2. Movement History Report
    await exportToCSV(`
      SELECT 
          ml.serial_number,
          ml.movement_date,
          ml.from_process,
          ml.to_process,
          ml.location,
          sm.design_code,
          sm.current_process as current_status
      FROM movement_log ml
      LEFT JOIN serial_master sm ON ml.serial_number = sm.serial_number
      ORDER BY ml.movement_date DESC
    `, 'Movement_History_Report.csv');
    
    // 3. Production Summary Report
    await exportToCSV(`
      SELECT 
          current_process,
          COUNT(*) as total_count,
          SUM(CASE WHEN is_rejected THEN 1 ELSE 0 END) as rejected_count,
          SUM(CASE WHEN is_rejected THEN 0 ELSE 1 END) as active_count,
          ROUND(
            (SUM(CASE WHEN is_rejected THEN 0 ELSE 1 END)::decimal / COUNT(*)) * 100, 2
          ) as success_rate_percent
      FROM serial_master
      GROUP BY current_process
      ORDER BY total_count DESC
    `, 'Production_Summary_Report.csv');
    
    // 4. Customer Report
    await exportToCSV(`
      SELECT 
          customer_id,
          name,
          email,
          phone,
          address,
          city,
          state,
          pincode,
          status,
          created_at
      FROM customers
      ORDER BY name
    `, 'Customer_Report.csv');
    
    // 5. Supplier Report
    await exportToCSV(`
      SELECT 
          supplier_id,
          name,
          email,
          phone,
          address,
          city,
          state,
          pincode,
          category,
          status,
          created_at
      FROM suppliers
      ORDER BY name
    `, 'Supplier_Report.csv');
    
    // 6. Daily Production Report
    await exportToCSV(`
      SELECT 
          DATE(entry_date) as production_date,
          COUNT(*) as total_entries,
          COUNT(CASE WHEN current_process = 'Kora' THEN 1 END) as kora_count,
          COUNT(CASE WHEN current_process = 'White' THEN 1 END) as white_count,
          COUNT(CASE WHEN current_process = 'Self' THEN 1 END) as self_count,
          COUNT(CASE WHEN current_process = 'Contrast' THEN 1 END) as contrast_count,
          COUNT(CASE WHEN is_rejected = true THEN 1 END) as rejected_count
      FROM serial_master
      WHERE entry_date >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(entry_date)
      ORDER BY production_date DESC
    `, 'Daily_Production_Report.csv');
    
    // 7. Location-wise Inventory Report
    await exportToCSV(`
      SELECT 
          current_location,
          current_process,
          COUNT(*) as item_count,
          COUNT(CASE WHEN is_rejected THEN 1 END) as rejected_count,
          COUNT(CASE WHEN is_rejected = false THEN 1 END) as active_count
      FROM serial_master
      WHERE current_location IS NOT NULL
      GROUP BY current_location, current_process
      ORDER BY current_location, current_process
    `, 'Location_Wise_Inventory_Report.csv');
    
    // 8. Design Code Analysis Report
    await exportToCSV(`
      SELECT 
          im.design_code,
          im.kora_code,
          im.white_code,
          im.self_code,
          im.contrast_code,
          COUNT(sm.serial_number) as total_produced,
          COUNT(CASE WHEN sm.is_rejected = false THEN 1 END) as active_count,
          COUNT(CASE WHEN sm.is_rejected = true THEN 1 END) as rejected_count,
          ROUND(
            (COUNT(CASE WHEN sm.is_rejected = false THEN 1 END)::decimal / COUNT(sm.serial_number)) * 100, 2
          ) as success_rate_percent
      FROM item_master im
      LEFT JOIN serial_master sm ON im.design_code = sm.design_code
      GROUP BY im.design_code, im.kora_code, im.white_code, im.self_code, im.contrast_code
      ORDER BY total_produced DESC
    `, 'Design_Code_Analysis_Report.csv');
    
    console.log('\n🎉 Excel Export Complete!');
    console.log('\n📁 Generated Files:');
    console.log('   ✅ Complete_Inventory_Report.csv');
    console.log('   ✅ Movement_History_Report.csv');
    console.log('   ✅ Production_Summary_Report.csv');
    console.log('   ✅ Customer_Report.csv');
    console.log('   ✅ Supplier_Report.csv');
    console.log('   ✅ Daily_Production_Report.csv');
    console.log('   ✅ Location_Wise_Inventory_Report.csv');
    console.log('   ✅ Design_Code_Analysis_Report.csv');
    
    console.log('\n💡 To open in Excel:');
    console.log('   1. Double-click any .csv file');
    console.log('   2. Or open Excel → File → Open → Select .csv file');
    console.log('   3. Save as .xlsx format for better formatting');
    
  } catch (error) {
    console.error('❌ Error in export process:', error.message);
  } finally {
    await pool.end();
  }
}

// Export specific report
async function exportSpecificReport(reportType) {
  try {
    console.log(`📊 Exporting ${reportType} report...\n`);
    
    const reports = {
      inventory: {
        query: `SELECT sm.serial_number, sm.entry_date, sm.design_code, sm.current_process, sm.current_location, sm.current_code, sm.is_rejected, im.kora_code, im.white_code, im.self_code, im.contrast_code FROM serial_master sm LEFT JOIN item_master im ON sm.design_code = im.design_code ORDER BY sm.entry_date DESC`,
        filename: 'Inventory_Report.csv'
      },
      movements: {
        query: `SELECT ml.serial_number, ml.movement_date, ml.from_process, ml.to_process, ml.location, sm.design_code FROM movement_log ml LEFT JOIN serial_master sm ON ml.serial_number = sm.serial_number ORDER BY ml.movement_date DESC`,
        filename: 'Movement_Report.csv'
      },
      production: {
        query: `SELECT current_process, COUNT(*) as total_count, SUM(CASE WHEN is_rejected THEN 1 ELSE 0 END) as rejected_count FROM serial_master GROUP BY current_process ORDER BY total_count DESC`,
        filename: 'Production_Report.csv'
      },
      customers: {
        query: `SELECT customer_id, name, email, phone, city, state, status FROM customers ORDER BY name`,
        filename: 'Customers_Report.csv'
      },
      suppliers: {
        query: `SELECT supplier_id, name, email, phone, city, state, category, status FROM suppliers ORDER BY name`,
        filename: 'Suppliers_Report.csv'
      }
    };
    
    if (reports[reportType]) {
      await exportToCSV(reports[reportType].query, reports[reportType].filename);
      console.log(`✅ ${reportType} report exported successfully!`);
    } else {
      console.log('❌ Invalid report type. Available types: inventory, movements, production, customers, suppliers');
    }
    
  } catch (error) {
    console.error('❌ Error exporting report:', error.message);
  } finally {
    await pool.end();
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length > 0) {
    // Export specific report
    await exportSpecificReport(args[0]);
  } else {
    // Export all reports
    await exportAllData();
  }
}

// Show usage information
if (process.argv.includes('--help')) {
  console.log(`
📊 Excel Export Tool Usage:

Export all reports:
  node export-to-excel.js

Export specific report:
  node export-to-excel.js [report_type]

Available report types:
  - inventory    : Complete inventory report
  - movements    : Movement history report  
  - production   : Production summary report
  - customers    : Customer report
  - suppliers    : Supplier report

Examples:
  node export-to-excel.js
  node export-to-excel.js inventory
  node export-to-excel.js movements
  `);
  process.exit(0);
}

main().catch(console.error);
