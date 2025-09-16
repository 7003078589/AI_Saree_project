const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');

const router = express.Router();

// Validation middleware
const validateMovement = [
  body('serialNumber').notEmpty().withMessage('Serial number is required'),
  body('fromProcess').notEmpty().withMessage('From process is required'),
  body('toProcess').notEmpty().withMessage('To process is required'),
  body('location').notEmpty().withMessage('Location is required')
];

// GET all movement logs with pagination and filters
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10000, serialNumber, process, date } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT 
        ml.id,
        ml.serial_number,
        ml.movement_date,
        ml.from_process,
        ml.done_to_process as to_process,
        ml.to_location as location,
        ml.created_at
      FROM movement_log ml
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramCount = 0;
    
    // Add serial number filter
    if (serialNumber) {
      paramCount++;
      query += ` AND ml.serial_number ILIKE $${paramCount}`;
      queryParams.push(`%${serialNumber}%`);
    }
    
    // Add process filter
    if (process) {
      paramCount++;
      query += ` AND (ml.from_process = $${paramCount} OR ml.done_to_process = $${paramCount})`;
      queryParams.push(process);
    }
    
    // Add date filter
    if (date) {
      paramCount++;
      query += ` AND DATE(ml.movement_date) = $${paramCount}`;
      queryParams.push(date);
    }
    
    // Add pagination
    paramCount++;
    query += ` ORDER BY ml.movement_date DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    queryParams.push(limit, offset);
    
    const result = await pool.query(query, queryParams);
    
    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM movement_log ml
      WHERE 1=1
    `;
    
    const countParams = [];
    paramCount = 0;
    
    if (serialNumber) {
      paramCount++;
      countQuery += ` AND ml.serial_number ILIKE $${paramCount}`;
      countParams.push(`%${serialNumber}%`);
    }
    
    if (process) {
      paramCount++;
      countQuery += ` AND (ml.from_process = $${paramCount} OR ml.done_to_process = $${paramCount})`;
      countParams.push(process);
    }
    
    if (date) {
      paramCount++;
      countQuery += ` AND DATE(ml.movement_date) = $${paramCount}`;
      countParams.push(date);
    }
    
    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);
    
    // Transform data to match frontend expectations
    const movements = result.rows.map(row => ({
      id: row.id.toString(),
      serialNumber: row.serial_number,
      fromProcess: row.from_process,
      toProcess: row.to_process,
      location: row.location,
      movementDate: row.movement_date,
      createdAt: row.created_at
    }));
    
    res.json({
      success: true,
      data: movements,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching movement logs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch movement logs',
      message: error.message
    });
  }
});

// GET movement log by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        ml.id,
        ml.serial_number,
        ml.movement_date,
        ml.from_process,
        ml.done_to_process as to_process,
        ml.to_location as location,
        ml.created_at
      FROM movement_log ml
      WHERE ml.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Movement log not found'
      });
    }
    
    const movement = result.rows[0];
    
    res.json({
      success: true,
      data: {
        id: movement.id.toString(),
        serialNumber: movement.serial_number,
        fromProcess: movement.from_process,
        toProcess: movement.to_process,
        location: movement.location,
        movementDate: movement.movement_date,
        createdAt: movement.created_at
      }
    });
    
  } catch (error) {
    console.error('Error fetching movement log:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch movement log',
      message: error.message
    });
  }
});

// GET movement history for a specific sari
router.get('/sari/:serialNumber', async (req, res) => {
  try {
    const { serialNumber } = req.params;
    
    const query = `
      SELECT 
        ml.id,
        ml.serial_number,
        ml.movement_date,
        ml.from_process,
        ml.done_to_process as to_process,
        ml.to_location as location,
        ml.created_at
      FROM movement_log ml
      WHERE ml.serial_number = $1
      ORDER BY ml.movement_date DESC
    `;
    
    const result = await pool.query(query, [serialNumber]);
    
    const movements = result.rows.map(row => ({
      id: row.id.toString(),
      serialNumber: row.serial_number,
      fromProcess: row.from_process,
      toProcess: row.to_process,
      location: row.location,
      movementDate: row.movement_date,
      createdAt: row.created_at
    }));
    
    res.json({
      success: true,
      data: movements
    });
    
  } catch (error) {
    console.error('Error fetching sari movement history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sari movement history',
      message: error.message
    });
  }
});

// POST create new movement log
router.post('/', validateMovement, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }
    
    const {
      serialNumber,
      fromProcess,
      toProcess,
      location,
      notes,
      operator
    } = req.body;
    
    // Check if sari exists
    const sariExists = await pool.query(
      'SELECT serial_number FROM serial_master WHERE serial_number = $1',
      [serialNumber]
    );
    
    if (sariExists.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Sari with this serial number does not exist'
      });
    }
    
    // Insert new movement log
    const insertQuery = `
      INSERT INTO movement_log (
        serial_number, movement_date, from_process, done_to_process, 
        to_location
      ) VALUES ($1, NOW(), $2, $3, $4)
      RETURNING *
    `;
    
    const result = await pool.query(insertQuery, [
      serialNumber,
      fromProcess,
      toProcess,
      location
    ]);
    
    // The PostgreSQL trigger will automatically update Serial_Master
    // But let's verify the update happened
    const updatedSari = await pool.query(
      'SELECT current_process, current_location, current_code FROM serial_master WHERE serial_number = $1',
      [serialNumber]
    );
    
    res.status(201).json({
      success: true,
      message: 'Movement log created successfully and Serial_Master updated automatically',
      data: {
        id: result.rows[0].id.toString(),
        serialNumber: result.rows[0].serial_number,
        fromProcess: result.rows[0].from_process,
        toProcess: result.rows[0].to_process,
        location: result.rows[0].location,
        movementDate: result.rows[0].movement_date,
        createdAt: result.rows[0].created_at
      },
      sariUpdate: {
        currentProcess: updatedSari.rows[0].current_process,
        currentLocation: updatedSari.rows[0].current_location,
        currentCode: updatedSari.rows[0].current_code
      }
    });
    
  } catch (error) {
    console.error('Error creating movement log:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create movement log',
      message: error.message
    });
  }
});

// PUT update movement log
router.put('/:id', validateMovement, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }
    
    const { id } = req.params;
    const {
      serialNumber,
      fromProcess,
      toProcess,
      location
    } = req.body;
    
    // Check if movement log exists
    const existingMovement = await pool.query(
      'SELECT id FROM movement_log WHERE id = $1',
      [id]
    );
    
    if (existingMovement.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Movement log not found'
      });
    }
    
    // Update movement log
    const updateQuery = `
      UPDATE movement_log 
      SET serial_number = $1, from_process = $2, done_to_process = $3, 
          to_location = $4
      WHERE id = $5
      RETURNING *
    `;
    
    const result = await pool.query(updateQuery, [
      serialNumber,
      fromProcess,
      toProcess,
      location,
      id
    ]);
    
    res.json({
      success: true,
      message: 'Movement log updated successfully',
      data: {
        id: result.rows[0].id.toString(),
        serialNumber: result.rows[0].serial_number,
        fromProcess: result.rows[0].from_process,
        toProcess: result.rows[0].to_process,
        location: result.rows[0].location,
        movementDate: result.rows[0].movement_date,
        createdAt: result.rows[0].created_at
      }
    });
    
  } catch (error) {
    console.error('Error updating movement log:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update movement log',
      message: error.message
    });
  }
});

// DELETE movement log
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if movement log exists
    const existingMovement = await pool.query(
      'SELECT id FROM movement_log WHERE id = $1',
      [id]
    );
    
    if (existingMovement.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Movement log not found'
      });
    }
    
    // Delete movement log
    await pool.query('DELETE FROM movement_log WHERE id = $1', [id]);
    
    res.json({
      success: true,
      message: 'Movement log deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting movement log:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete movement log',
      message: error.message
    });
  }
});

// GET movement statistics
router.get('/stats/summary', async (req, res) => {
  try {
    // Total movements
    const totalMovements = await pool.query('SELECT COUNT(*) as total FROM movement_log');
    
    // Unique saris with movements
    const uniqueSaris = await pool.query('SELECT COUNT(DISTINCT serial_number) as total FROM movement_log');
    
    // Movements by process
    const processStats = await pool.query(`
      SELECT 
        done_to_process as process,
        COUNT(*) as count
      FROM movement_log 
      GROUP BY done_to_process 
      ORDER BY count DESC
    `);
    
    // Recent movements (last 7 days)
    const recentMovements = await pool.query(`
      SELECT COUNT(*) as total
      FROM movement_log 
      WHERE movement_date >= NOW() - INTERVAL '7 days'
    `);
    
    res.json({
      success: true,
      data: {
        totalMovements: parseInt(totalMovements.rows[0].total),
        uniqueSaris: parseInt(uniqueSaris.rows[0].total),
        processStats: processStats.rows,
        recentMovements: parseInt(recentMovements.rows[0].total)
      }
    });
    
  } catch (error) {
    console.error('Error fetching movement statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch movement statistics',
      message: error.message
    });
  }
});

module.exports = router;
