# Database Structure Documentation

## Overview
The database has been restructured to match the table format shown in the application images. The new structure includes proper column names and data types that align with the user interface.

## Tables

### 1. serial_master
This table stores information about individual sari items with their current status.

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PRIMARY KEY | Auto-incrementing unique identifier |
| numbr | INTEGER NOT NULL | Number field (matches "Numbr" column in UI) |
| serial_number | VARCHAR(50) NOT NULL UNIQUE | Serial number (e.g., E6421) |
| item_code | TEXT NOT NULL | Item code/design description |
| entry_date | DATE NOT NULL | Date when item was entered |
| batch_number | INTEGER | Batch number for grouping |
| current_process | VARCHAR(100) | Current processing stage (e.g., Kora, White, Self) |
| current_code | TEXT | Current process code |
| latest_movement_dt | TEXT | Latest movement date or "No Movement" |
| current_location | TEXT | Current location of the item |
| created_at | TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP | Record last update timestamp |

### 2. item_master
This table stores master data for different item types and their process codes.

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PRIMARY KEY | Auto-incrementing unique identifier |
| item_code | TEXT NOT NULL UNIQUE | Item code/design description |
| kora | TEXT | Kora process code |
| white | TEXT | White process code |
| self | TEXT | Self process code |
| contrast | TEXT | Contrast process code |
| created_at | TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP | Record last update timestamp |

### 3. movement_log
This table tracks all movements and status changes of items.

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PRIMARY KEY | Auto-incrementing unique identifier |
| serial_number | VARCHAR(50) NOT NULL | Serial number of the item |
| item_code | TEXT NOT NULL | Item code/design description |
| movement_date | DATE | Date of the movement |
| done_to_process | TEXT | Process that was completed |
| from_process | TEXT | Source process |
| body_colour | TEXT | Body color information |
| border_colour | TEXT | Border color information |
| from_location | TEXT | Source location |
| to_location | TEXT | Destination location |
| quality | TEXT | Quality information |
| document_number | TEXT | Associated document number |
| notes | TEXT | Additional notes |
| created_at | TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP | Record last update timestamp |

### 4. customers
This table stores customer information.

| Column | Type | Description |
|--------|------|-------------|
| customer_id | SERIAL PRIMARY KEY | Auto-incrementing unique identifier |
| name | VARCHAR(255) NOT NULL | Customer name |
| email | VARCHAR(255) | Customer email |
| phone | VARCHAR(20) | Customer phone number |
| address | TEXT | Customer address |
| city | VARCHAR(100) | Customer city |
| state | VARCHAR(100) | Customer state |
| pincode | VARCHAR(10) | Customer pincode |
| status | VARCHAR(20) DEFAULT 'active' | Customer status |
| created_at | TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP | Record last update timestamp |

### 5. suppliers
This table stores supplier information.

| Column | Type | Description |
|--------|------|-------------|
| supplier_id | SERIAL PRIMARY KEY | Auto-incrementing unique identifier |
| name | VARCHAR(255) NOT NULL | Supplier name |
| email | VARCHAR(255) | Supplier email |
| phone | VARCHAR(20) | Supplier phone number |
| address | TEXT | Supplier address |
| city | VARCHAR(100) | Supplier city |
| state | VARCHAR(100) | Supplier state |
| pincode | VARCHAR(10) | Supplier pincode |
| category | VARCHAR(100) DEFAULT 'general' | Supplier category |
| status | VARCHAR(20) DEFAULT 'active' | Supplier status |
| created_at | TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP | Record last update timestamp |

## Indexes
The following indexes have been created for better performance:

- `idx_serial_master_serial_number` on serial_master(serial_number)
- `idx_serial_master_item_code` on serial_master(item_code)
- `idx_serial_master_current_process` on serial_master(current_process)
- `idx_movement_log_serial_number` on movement_log(serial_number)
- `idx_movement_log_item_code` on movement_log(item_code)
- `idx_movement_log_movement_date` on movement_log(movement_date)
- `idx_item_master_item_code` on item_master(item_code)

## Data Upload
The database can be populated using the following scripts:

1. `recreate-database-simple.js` - Recreates the entire database with sample data
2. `upload-csv-data-new.js` - Uploads data from CSV files
3. `update-column-sizes.js` - Updates column sizes if needed

## Sample Data
The database includes sample data that matches the format shown in the application images:

- **serial_master**: 23 records with items in "Kora" process
- **item_master**: 32 records with various item codes and their process variations
- **movement_log**: 11 records showing movements from "Self Dyed" to "1C" location
- **customers**: 2 sample customer records
- **suppliers**: 2 sample supplier records

## Key Features
- Proper column naming that matches the UI
- Support for long item descriptions using TEXT fields
- Proper handling of empty/null values
- Foreign key relationships between tables
- Comprehensive indexing for performance
- Timestamp tracking for audit purposes

## Usage
The database structure now perfectly matches the table format shown in your application images, with proper column headers and data types that support the full range of data you need to store.
