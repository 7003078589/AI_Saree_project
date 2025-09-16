# 📊 Complete Data Upload Guide for Sari Inventory System

## 🎯 Overview
This guide provides **4 different methods** to upload your real sari inventory data and export it to Excel for analysis in pgAdmin.

---

## 🚀 Method 1: CSV File Upload (Recommended)

### Step 1: Create Sample CSV Files
```bash
cd sari-inventory-app/backend
node upload-csv-data.js --create-samples
```

### Step 2: Edit CSV Files with Your Real Data
The script creates these CSV files with the correct format:

#### `serial_master.csv` Format:
```csv
serial_number,entry_date,design_code,current_process,current_location,current_code,is_rejected
SARI001,2024-01-15,DESIGN001,Kora,Production Floor A,KORA001,false
SARI002,2024-01-16,DESIGN002,White,Production Floor B,WHITE002,false
```

#### `item_master.csv` Format:
```csv
design_code,kora_code,white_code,self_code,contrast_code
DESIGN001,KORA001,WHITE001,SELF001,CONTRAST001
DESIGN002,KORA002,WHITE002,SELF002,CONTRAST002
```

#### `movement_log.csv` Format:
```csv
serial_number,movement_date,from_process,to_process,location
SARI001,2024-01-15 10:00:00,Entry,Kora,Production Floor A
SARI001,2024-01-15 14:00:00,Kora,White,Production Floor B
```

#### `customers.csv` Format:
```csv
name,email,phone,address,city,state,pincode
"Raj Textiles","raj@textiles.com","+91-9876543210","123 Textile Market","Mumbai","Maharashtra","400001"
```

#### `suppliers.csv` Format:
```csv
name,email,phone,address,city,state,pincode,category
"Fabric Supplier","fabric@supplier.com","+91-9876543220","789 Supply Chain","Mumbai","Maharashtra","400002","Fabric"
```

### Step 3: Upload Data
```bash
node upload-csv-data.js
```

---

## 📝 Method 2: Direct SQL INSERT in pgAdmin

### Step 1: Open pgAdmin
1. Connect to your PostgreSQL database
2. Open Query Tool (Tools → Query Tool)

### Step 2: Copy SQL Queries
Use the queries from `real-data-queries.sql` file:

```sql
-- Insert Serial Master Data
INSERT INTO serial_master (serial_number, entry_date, design_code, current_process, current_location, current_code, is_rejected) VALUES
('SARI001', '2024-01-15', 'DESIGN001', 'Kora', 'Production Floor A', 'KORA001', false),
('SARI002', '2024-01-16', 'DESIGN002', 'White', 'Production Floor B', 'WHITE002', false);

-- Insert Item Master Data
INSERT INTO item_master (design_code, kora_code, white_code, self_code, contrast_code) VALUES
('DESIGN001', 'KORA001', 'WHITE001', 'SELF001', 'CONTRAST001'),
('DESIGN002', 'KORA002', 'WHITE002', 'SELF002', 'CONTRAST002');
```

### Step 3: Execute Queries
1. Replace sample data with your real data
2. Click Execute (F5) to run the queries

---

## 📄 Method 3: JSON Data Upload

### Step 1: Create JSON File
Create a file named `data.json`:

```json
{
  "serial_master": [
    {
      "serial_number": "SARI001",
      "entry_date": "2024-01-15",
      "design_code": "DESIGN001",
      "current_process": "Kora",
      "current_location": "Production Floor A",
      "current_code": "KORA001",
      "is_rejected": false
    }
  ],
  "item_master": [
    {
      "design_code": "DESIGN001",
      "kora_code": "KORA001",
      "white_code": "WHITE001",
      "self_code": "SELF001",
      "contrast_code": "CONTRAST001"
    }
  ]
}
```

### Step 2: Use JSON Upload Script
```bash
node upload-json-data.js
```

---

## 📊 Method 4: Excel Export Queries

### Step 1: Export All Reports
```bash
node export-to-excel.js
```

### Step 2: Export Specific Report
```bash
node export-to-excel.js inventory    # Inventory report
node export-to-excel.js movements    # Movement history
node export-to-excel.js production   # Production summary
node export-to-excel.js customers    # Customer report
node export-to-excel.js suppliers    # Supplier report
```

### Step 3: Open in Excel
1. Double-click any generated `.csv` file
2. Save as `.xlsx` format for better formatting

---

## 🎯 Quick Start Guide

### For CSV Upload (Easiest):
1. Run: `node upload-csv-data.js --create-samples`
2. Edit the CSV files with your real data
3. Run: `node upload-csv-data.js`
4. Run: `node export-to-excel.js`

### For Direct SQL Upload:
1. Open pgAdmin
2. Copy queries from `real-data-queries.sql`
3. Replace sample data with your real data
4. Execute queries in pgAdmin
5. Use export queries to get Excel files

---

## 📋 Database Tables Structure

### `serial_master` - Main Sari Tracking
- `serial_number` (VARCHAR, PRIMARY KEY)
- `entry_date` (DATE)
- `design_code` (VARCHAR)
- `current_process` (VARCHAR)
- `current_location` (VARCHAR)
- `current_code` (VARCHAR)
- `is_rejected` (BOOLEAN)

### `item_master` - Design Codes
- `design_code` (VARCHAR, PRIMARY KEY)
- `kora_code` (VARCHAR)
- `white_code` (VARCHAR)
- `self_code` (VARCHAR)
- `contrast_code` (VARCHAR)

### `movement_log` - Production Flow
- `movement_id` (SERIAL, PRIMARY KEY)
- `serial_number` (VARCHAR)
- `movement_date` (TIMESTAMP)
- `from_process` (VARCHAR)
- `to_process` (VARCHAR)
- `location` (VARCHAR)

### `customers` - Customer Information
- `customer_id` (SERIAL, PRIMARY KEY)
- `name` (VARCHAR)
- `email` (VARCHAR)
- `phone` (VARCHAR)
- `address` (TEXT)
- `city` (VARCHAR)
- `state` (VARCHAR)
- `pincode` (VARCHAR)
- `status` (VARCHAR)

### `suppliers` - Supplier Information
- `supplier_id` (SERIAL, PRIMARY KEY)
- `name` (VARCHAR)
- `email` (VARCHAR)
- `phone` (VARCHAR)
- `address` (TEXT)
- `city` (VARCHAR)
- `state` (VARCHAR)
- `pincode` (VARCHAR)
- `category` (VARCHAR)
- `status` (VARCHAR)

---

## 🔧 Troubleshooting

### Common Issues:

1. **CSV Upload Fails**
   - Check CSV file format (headers must match exactly)
   - Ensure no empty rows at the end
   - Use quotes around text containing commas

2. **SQL Insert Fails**
   - Check data types match column definitions
   - Ensure required fields are not NULL
   - Check for duplicate primary keys

3. **Excel Export Issues**
   - Ensure database connection is working
   - Check if tables have data
   - Verify file permissions for writing

### Data Validation Queries:
```sql
-- Check for data inconsistencies
SELECT * FROM serial_master WHERE serial_number IS NULL;
SELECT * FROM movement_log WHERE serial_number NOT IN (SELECT serial_number FROM serial_master);
```

---

## 📊 Available Excel Reports

1. **Complete_Inventory_Report.csv** - All sari data with design codes
2. **Movement_History_Report.csv** - Complete production flow history
3. **Production_Summary_Report.csv** - Process-wise statistics
4. **Customer_Report.csv** - Customer information
5. **Supplier_Report.csv** - Supplier information
6. **Daily_Production_Report.csv** - Daily production statistics
7. **Location_Wise_Inventory_Report.csv** - Location-based inventory
8. **Design_Code_Analysis_Report.csv** - Design performance analysis

---

## 🎉 Success Checklist

- [ ] Data uploaded successfully (check record counts)
- [ ] All tables populated with real data
- [ ] Excel reports generated
- [ ] Data validation queries show no errors
- [ ] Dashboard shows updated statistics

---

## 💡 Tips for Best Results

1. **Start with CSV method** - easiest and most reliable
2. **Backup your data** before making changes
3. **Validate data** using provided validation queries
4. **Export regularly** to Excel for analysis
5. **Use transactions** for multiple related operations
6. **Test with small dataset** first before bulk upload

---

## 📞 Need Help?

If you encounter any issues:
1. Check the console output for error messages
2. Verify your database connection
3. Ensure all required fields are provided
4. Check data format matches expected types

The system is designed to handle your real sari inventory data efficiently and provide comprehensive Excel reports for analysis!
