const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// GET /api/design-codes - Get all available design codes
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT design_code, kora_code, white_code, self_code, contrast_code
      FROM item_master
      ORDER BY design_code
    `;
    
    const result = await pool.query(query);
    
    res.json({
      success: true,
      data: result.rows,
      message: 'Design codes retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching design codes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch design codes',
      message: error.message
    });
  }
});

module.exports = router;
