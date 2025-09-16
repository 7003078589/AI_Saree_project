const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');

const router = express.Router();

// Validation middleware
const validateSari = [
  body('serialNumber').notEmpty().withMessage('Serial number is required'),
  body('designCode').notEmpty().withMessage('Design code is required'),
  body('entryDate').notEmpty().withMessage('Entry date is required')
  // Note: currentProcess and currentLocation are optional in database
];

// GET all saris with pagination and search
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, process, status } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT 
        sm.serial_number,
        sm.entry_date,
        sm.item_code as design_code,
        sm.current_process,
        sm.current_location,
        sm.current_code,
        false as is_rejected,
        im.kora,
        im.white,
        im.self,
        im.contrast
      FROM serial_master sm
      LEFT JOIN item_master im ON sm.item_code = im.item_code
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramCount = 0;
    
    // Add search filter
    if (search) {
      paramCount++;
      query += ` AND (sm.serial_number ILIKE $${paramCount} OR sm.item_code ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }
    
    // Add process filter
    if (process) {
      paramCount++;
      query += ` AND sm.current_process = $${paramCount}`;
      queryParams.push(process);
    }
    
    // Add status filter (all saris are active in your system)
    // if (status === 'rejected') {
    //   query += ` AND false as is_rejected = true`;
    // } else if (status === 'active') {
    //   query += ` AND false as is_rejected = false`;
    // }
    
    // Add pagination
    paramCount++;
    query += ` ORDER BY sm.entry_date DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    queryParams.push(limit, offset);
    
    const result = await pool.query(query, queryParams);
    
    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM serial_master sm
      WHERE 1=1
    `;
    
    const countParams = [];
    paramCount = 0;
    
    if (search) {
      paramCount++;
      countQuery += ` AND (sm.serial_number ILIKE $${paramCount} OR sm.item_code ILIKE $${paramCount})`;
      countParams.push(`%${search}%`);
    }
    
    if (process) {
      paramCount++;
      countQuery += ` AND sm.current_process = $${paramCount}`;
      countParams.push(process);
    }
    
    // if (status === 'rejected') {
    //   countQuery += ` AND false as is_rejected = true`;
    // } else if (status === 'active') {
    //   countQuery += ` AND false as is_rejected = false`;
    // }
    
    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);
    
    // Transform data to match frontend expectations
    const saris = result.rows.map(row => ({
      id: row.serial_number,
      serialNumber: row.serial_number,
      designCode: row.design_code,
      currentProcess: row.current_process,
      currentLocation: row.current_location,
      currentCode: row.current_code,
      isRejected: false, // All saris are active in your system
      entryDate: row.entry_date,
      status: 'active',
      description: `${row.design_code} - ${row.current_process} process`,
      price: null // You can add price field if needed
    }));
    
    res.json({
      success: true,
      data: saris,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching saris:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch saris',
      message: error.message
    });
  }
});

// GET single sari by serial number
router.get('/:serialNumber', async (req, res) => {
  try {
    const { serialNumber } = req.params;
    
    const query = `
      SELECT 
        sm.serial_number,
        sm.entry_date,
        sm.item_code as design_code,
        sm.current_process,
        sm.current_location,
        sm.current_code,
        false as is_rejected,
        im.kora,
        im.white,
        im.self,
        im.contrast
      FROM serial_master sm
      LEFT JOIN item_master im ON sm.item_code = im.item_code
      WHERE sm.serial_number = $1
    `;
    
    const result = await pool.query(query, [serialNumber]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Sari not found'
      });
    }
    
    const sari = result.rows[0];
    
    res.json({
      success: true,
      data: {
        id: sari.serial_number,
        serialNumber: sari.serial_number,
        designCode: sari.design_code,
        currentProcess: sari.current_process,
        currentLocation: sari.current_location,
        currentCode: sari.current_code,
        isRejected: false, // All saris are active in your system
        entryDate: sari.entry_date,
        status: 'active',
        description: `${sari.design_code} - ${sari.current_process} process`
      }
    });
    
  } catch (error) {
    console.error('Error fetching sari:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sari',
      message: error.message
    });
  }
});

// POST create new sari
router.post('/', validateSari, async (req, res) => {
  try {
    console.log('📥 Received request body:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }
    
    const {
      serialNumber,
      designCode,
      currentProcess,
      currentLocation,
      entryDate
    } = req.body;
    
    console.log('✅ Extracted data:', { serialNumber, designCode, currentProcess, currentLocation, entryDate });
    
    // Check if sari already exists
    const existingSari = await pool.query(
      'SELECT serial_number FROM serial_master WHERE serial_number = $1',
      [serialNumber]
    );
    
    if (existingSari.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Sari with this serial number already exists'
      });
    }
    
    // Check if design code exists in item_master, if not create it
    let designExists = await pool.query(
      'SELECT item_code FROM item_master WHERE item_code = $1',
      [designCode]
    );
    
    if (designExists.rows.length === 0) {
      // Create new design code with auto-generated process codes
      const newKoraCode = `KORA${designCode}`;
      const newWhiteCode = `WHITE${designCode}`;
      const newSelfCode = `SELF${designCode}`;
      const newContrastCode = `CONTRAST${designCode}`;
      
      await pool.query(`
        INSERT INTO item_master (item_code, kora, white, self, contrast)
        VALUES ($1, $2, $3, $4, $5)
      `, [designCode, newKoraCode, newWhiteCode, newSelfCode, newContrastCode]);
      
      console.log(`✅ Created new design code: ${designCode} with process codes`);
    }
    
    // Get the appropriate current code based on process
    let currentCode = '';
    if (currentProcess === 'Kora') {
      const koraResult = await pool.query(
        'SELECT kora FROM item_master WHERE item_code = $1',
        [designCode]
      );
      currentCode = koraResult.rows[0]?.kora || `KORA${designCode}`;
    } else if (currentProcess === 'White') {
      const whiteResult = await pool.query(
        'SELECT white FROM item_master WHERE item_code = $1',
        [designCode]
      );
      currentCode = whiteResult.rows[0]?.white || `WHITE${designCode}`;
    } else if (currentProcess === 'Self') {
      const selfResult = await pool.query(
        'SELECT self FROM item_master WHERE item_code = $1',
        [designCode]
      );
      currentCode = selfResult.rows[0]?.self || `SELF${designCode}`;
    } else if (currentProcess === 'Contrast') {
      const contrastResult = await pool.query(
        'SELECT contrast FROM item_master WHERE item_code = $1',
        [designCode]
      );
      currentCode = contrastResult.rows[0]?.contrast || `CONTRAST${designCode}`;
    }
    
    // Insert new sari
    const insertQuery = `
      INSERT INTO serial_master (
        serial_number, entry_date, item_code, current_process, 
        current_location, current_code
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    console.log('🗄️ Inserting with values:', [serialNumber, entryDate, designCode, currentProcess, currentLocation, currentCode]);
    
    const result = await pool.query(insertQuery, [
      serialNumber,
      entryDate,
      designCode,
      currentProcess,
      currentLocation,
      currentCode
    ]);
    
    console.log('✅ Insert successful:', result.rows[0]);
    
    res.status(201).json({
      success: true,
      message: 'Sari created successfully',
      data: {
        id: result.rows[0].serial_number,
        serialNumber: result.rows[0].serial_number,
        designCode: result.rows[0].item_code,
        currentProcess: result.rows[0].current_process,
        currentLocation: result.rows[0].current_location,
        currentCode: result.rows[0].current_code,
        isRejected: result.rows[0].is_rejected,
        entryDate: result.rows[0].entry_date,
        status: 'active'
      }
    });
    
  } catch (error) {
    console.error('Error creating sari:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create sari',
      message: error.message
    });
  }
});

// PUT update sari
router.put('/:serialNumber', [
  body('designCode').notEmpty().withMessage('Design code is required'),
  body('entryDate').notEmpty().withMessage('Entry date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }
    
    const { serialNumber } = req.params;
    const {
      designCode,
      currentProcess,
      currentLocation,
      entryDate
    } = req.body;
    
    // Check if sari exists
    const existingSari = await pool.query(
      'SELECT serial_number FROM serial_master WHERE serial_number = $1',
      [serialNumber]
    );
    
    if (existingSari.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Sari not found'
      });
    }
    
    // Get the appropriate current code based on process
    let currentCode = '';
    if (currentProcess === 'Kora') {
      const koraResult = await pool.query(
        'SELECT kora FROM item_master WHERE item_code = $1',
        [designCode]
      );
      currentCode = koraResult.rows[0]?.kora_code || 'KORA001';
    } else if (currentProcess === 'White') {
      const whiteResult = await pool.query(
        'SELECT white FROM item_master WHERE item_code = $1',
        [designCode]
      );
      currentCode = whiteResult.rows[0]?.white_code || 'WHITE001';
    } else if (currentProcess === 'Self') {
      const selfResult = await pool.query(
        'SELECT self FROM item_master WHERE item_code = $1',
        [designCode]
      );
      currentCode = selfResult.rows[0]?.self_code || 'SELF001';
    } else if (currentProcess === 'Contrast') {
      const contrastResult = await pool.query(
        'SELECT contrast FROM item_master WHERE item_code = $1',
        [designCode]
      );
      currentCode = contrastResult.rows[0]?.contrast_code || 'CONTRAST001';
    }
    
    // Update sari
    const updateQuery = `
      UPDATE serial_master 
      SET item_code = $1, current_process = $2, current_location = $3, 
          current_code = $4, entry_date = $5
      WHERE serial_number = $6
      RETURNING *
    `;
    
    const result = await pool.query(updateQuery, [
      designCode,
      currentProcess,
      currentLocation,
      currentCode,
      entryDate,
      serialNumber
    ]);
    
    res.json({
      success: true,
      message: 'Sari updated successfully',
      data: {
        id: result.rows[0].serial_number,
        serialNumber: result.rows[0].serial_number,
        designCode: result.rows[0].item_code,
        currentProcess: result.rows[0].current_process,
        currentLocation: result.rows[0].current_location,
        currentCode: result.rows[0].current_code,
        isRejected: result.rows[0].is_rejected,
        entryDate: result.rows[0].entry_date,
        status: result.rows[0].is_rejected ? 'rejected' : 'active'
      }
    });
    
  } catch (error) {
    console.error('Error updating sari:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update sari',
      message: error.message
    });
  }
});

// DELETE sari (soft delete by marking as rejected)
router.delete('/:serialNumber', async (req, res) => {
  try {
    const { serialNumber } = req.params;
    
    // Check if sari exists
    const existingSari = await pool.query(
      'SELECT serial_number FROM serial_master WHERE serial_number = $1',
      [serialNumber]
    );
    
    if (existingSari.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Sari not found'
      });
    }
    
    // Delete the sari (hard delete since no is_rejected column)
    const result = await pool.query(
      'DELETE FROM serial_master WHERE serial_number = $1 RETURNING *',
      [serialNumber]
    );
    
    res.json({
      success: true,
      message: 'Sari deleted successfully',
      data: {
        id: result.rows[0].serial_number,
        serialNumber: result.rows[0].serial_number,
        isRejected: false
      }
    });
    
  } catch (error) {
    console.error('Error deleting sari:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete sari',
      message: error.message
    });
  }
});

module.exports = router;
