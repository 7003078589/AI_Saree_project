const fs = require('fs');
const path = require('path');

// 🔍 FIND AND UPLOAD YOUR CSV FILE
// This script helps you locate your "Saree Tracker(Serial Master)" CSV file

function findCSVFiles() {
  console.log('🔍 Searching for your CSV file...\n');
  
  // Search in current directory and parent directories
  const searchPaths = [
    '.', // Current directory (backend)
    '..', // Parent directory (sari-inventory-app)
    '../..', // Grandparent directory (AI Sari Tracking Inventory)
    '../../..', // Great-grandparent directory
  ];
  
  const foundFiles = [];
  
  for (const searchPath of searchPaths) {
    try {
      if (fs.existsSync(searchPath)) {
        const files = fs.readdirSync(searchPath);
        const csvFiles = files.filter(file => 
          file.toLowerCase().includes('saree') && 
          file.toLowerCase().includes('tracker') && 
          file.toLowerCase().endsWith('.csv')
        );
        
        csvFiles.forEach(file => {
          const fullPath = path.resolve(searchPath, file);
          foundFiles.push({
            name: file,
            path: fullPath,
            directory: searchPath
          });
        });
      }
    } catch (error) {
      // Skip directories that can't be read
    }
  }
  
  if (foundFiles.length > 0) {
    console.log('✅ Found potential CSV files:');
    foundFiles.forEach((file, index) => {
      console.log(`   ${index + 1}. ${file.name}`);
      console.log(`      📁 Location: ${file.path}`);
    });
    
    // Copy the first found file to current directory
    const targetFile = foundFiles[0];
    const targetName = 'Saree Tracker(Serial Master).csv';
    
    try {
      fs.copyFileSync(targetFile.path, targetName);
      console.log(`\n✅ Copied "${targetFile.name}" to current directory as "${targetName}"`);
      console.log('🚀 Ready to upload! Run: node upload-saree-tracker.js');
    } catch (error) {
      console.log(`❌ Error copying file: ${error.message}`);
    }
    
  } else {
    console.log('❌ No CSV files found with "Saree Tracker" in the name');
    console.log('\n📁 Searching all CSV files in common locations...');
    
    // Search for any CSV files
    const allCsvFiles = [];
    
    for (const searchPath of searchPaths) {
      try {
        if (fs.existsSync(searchPath)) {
          const files = fs.readdirSync(searchPath);
          const csvFiles = files.filter(file => file.toLowerCase().endsWith('.csv'));
          
          csvFiles.forEach(file => {
            const fullPath = path.resolve(searchPath, file);
            allCsvFiles.push({
              name: file,
              path: fullPath,
              directory: searchPath
            });
          });
        }
      } catch (error) {
        // Skip directories that can't be read
      }
    }
    
    if (allCsvFiles.length > 0) {
      console.log('📋 Found these CSV files:');
      allCsvFiles.forEach((file, index) => {
        console.log(`   ${index + 1}. ${file.name} (in ${file.directory})`);
      });
      
      console.log('\n💡 If one of these is your Saree Tracker file:');
      console.log('   1. Copy it to the backend directory');
      console.log('   2. Rename it to "Saree Tracker(Serial Master).csv"');
      console.log('   3. Run: node upload-saree-tracker.js');
    } else {
      console.log('❌ No CSV files found in common locations');
      console.log('\n💡 Please:');
      console.log('   1. Copy your "Saree Tracker(Serial Master)" CSV file to this directory');
      console.log('   2. Run: node upload-saree-tracker.js');
    }
  }
}

function showUploadInstructions() {
  console.log('\n📋 Upload Instructions:');
  console.log('   1. Ensure your CSV file is in the backend directory');
  console.log('   2. Run: node upload-saree-tracker.js');
  console.log('   3. The script will automatically map your columns');
  console.log('   4. Check the preview before confirming upload');
  
  console.log('\n📊 Expected CSV Format (your file may have different column names):');
  console.log('   - Serial Number / ID / Sari Number');
  console.log('   - Entry Date / Date / Production Date');
  console.log('   - Design Code / Design / Pattern Code');
  console.log('   - Current Process / Stage / Status');
  console.log('   - Location / Floor / Department');
  console.log('   - Any other columns will be preserved');
  
  console.log('\n🎯 The script will automatically:');
  console.log('   ✅ Map your column names to database fields');
  console.log('   ✅ Create missing item_master entries');
  console.log('   ✅ Handle duplicate records');
  console.log('   ✅ Show upload progress and statistics');
}

// Main execution
function main() {
  console.log('🚀 Saree Tracker CSV File Locator\n');
  
  findCSVFiles();
  showUploadInstructions();
}

main();
