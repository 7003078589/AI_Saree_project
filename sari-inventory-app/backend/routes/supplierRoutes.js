const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');

const router = express.Router();

// Validation middleware
const validateSupplier = [
  body('name').notEmpty().withMessage('Supplier name is required'),
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('phone').optional().isMobilePhone().withMessage('Invalid phone number format')
];

// GET all suppliers with pagination and search
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status, category } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
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
        created_at,
        updated_at
      FROM suppliers
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramCount = 0;
    
    // Add search filter
    if (search) {
      paramCount++;
      query += ` AND (name ILIKE $${paramCount} OR email ILIKE $${paramCount} OR phone ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }
    
    // Add status filter
    if (status) {
      paramCount++;
      query += ` AND status = $${paramCount}`;
      queryParams.push(status);
    }
    
    // Add category filter
    if (category) {
      paramCount++;
      query += ` AND category = $${paramCount}`;
      queryParams.push(category);
    }
    
    // Add pagination
    paramCount++;
    query += ` ORDER BY name ASC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    queryParams.push(limit, offset);
    
    const result = await pool.query(query, queryParams);
    
    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM suppliers
      WHERE 1=1
    `;
    
    const countParams = [];
    paramCount = 0;
    
    if (search) {
      paramCount++;
      countQuery += ` AND (name ILIKE $${paramCount} OR email ILIKE $${paramCount} OR phone ILIKE $${paramCount})`;
      countParams.push(`%${search}%`);
    }
    
    if (status) {
      paramCount++;
      countQuery += ` AND status = $${paramCount}`;
      countParams.push(status);
    }
    
    if (category) {
      paramCount++;
      countQuery += ` AND category = $${paramCount}`;
      countParams.push(category);
    }
    
    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);
    
    // Transform data for frontend
    const suppliers = result.rows.map(row => ({
      id: row.supplier_id.toString(),
      name: row.name,
      email: row.email || '',
      phone: row.phone || '',
      address: row.address || '',
      city: row.city || '',
      state: row.state || '',
      pincode: row.pincode || '',
      category: row.category || 'general',
      status: row.status || 'active',
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
    
    res.json({
      success: true,
      data: suppliers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch suppliers',
      message: error.message
    });
  }
});

// GET supplier by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
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
        created_at,
        updated_at
      FROM suppliers
      WHERE supplier_id = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Supplier not found'
      });
    }
    
    const supplier = result.rows[0];
    
    res.json({
      success: true,
      data: {
        id: supplier.supplier_id.toString(),
        name: supplier.name,
        email: supplier.email || '',
        phone: supplier.phone || '',
        address: supplier.address || '',
        city: supplier.city || '',
        state: supplier.state || '',
        pincode: supplier.pincode || '',
        category: supplier.category || 'general',
        status: supplier.status || 'active',
        createdAt: supplier.created_at,
        updatedAt: supplier.updated_at
      }
    });
    
  } catch (error) {
    console.error('Error fetching supplier:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch supplier',
      message: error.message
    });
  }
});

// POST create new supplier
router.post('/', validateSupplier, async (req, res) => {
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
      name,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      category = 'general',
      status = 'active'
    } = req.body;
    
    // Check if supplier with same email or phone already exists
    if (email) {
      const existingEmail = await pool.query(
        'SELECT supplier_id FROM suppliers WHERE email = $1',
        [email]
      );
      
      if (existingEmail.rows.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Supplier with this email already exists'
        });
      }
    }
    
    if (phone) {
      const existingPhone = await pool.query(
        'SELECT supplier_id FROM suppliers WHERE phone = $1',
        [phone]
      );
      
      if (existingPhone.rows.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Supplier with this phone number already exists'
        });
      }
    }
    
    // Insert new supplier
    const insertQuery = `
      INSERT INTO suppliers (
        name, email, phone, address, city, state, pincode, category, status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING *
    `;
    
    const result = await pool.query(insertQuery, [
      name,
      email || null,
      phone || null,
      address || null,
      city || null,
      state || null,
      pincode || null,
      category,
      status
    ]);
    
    const newSupplier = result.rows[0];
    
    res.status(201).json({
      success: true,
      message: 'Supplier created successfully',
      data: {
        id: newSupplier.supplier_id.toString(),
        name: newSupplier.name,
        email: newSupplier.email || '',
        phone: newSupplier.phone || '',
        address: newSupplier.address || '',
        city: newSupplier.city || '',
        state: newSupplier.state || '',
        pincode: newSupplier.pincode || '',
        category: newSupplier.category || 'general',
        status: newSupplier.status || 'active',
        createdAt: newSupplier.created_at,
        updatedAt: newSupplier.updated_at
      }
    });
    
  } catch (error) {
    console.error('Error creating supplier:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create supplier',
      message: error.message
    });
  }
});

// PUT update supplier
router.put('/:id', validateSupplier, async (req, res) => {
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
      name,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      category,
      status
    } = req.body;
    
    // Check if supplier exists
    const existingSupplier = await pool.query(
      'SELECT supplier_id FROM suppliers WHERE supplier_id = $1',
      [id]
    );
    
    if (existingSupplier.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Supplier not found'
      });
    }
    
    // Check if email/phone conflicts with other suppliers
    if (email) {
      const existingEmail = await pool.query(
        'SELECT supplier_id FROM suppliers WHERE email = $1 AND supplier_id != $2',
        [email, id]
      );
      
      if (existingEmail.rows.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Email already exists with another supplier'
        });
      }
    }
    
    if (phone) {
      const existingPhone = await pool.query(
        'SELECT supplier_id FROM suppliers WHERE phone = $1 AND supplier_id != $2',
        [phone, id]
      );
      
      if (existingPhone.rows.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Phone number already exists with another supplier'
        });
      }
    }
    
    // Update supplier
    const updateQuery = `
      UPDATE suppliers 
      SET name = $1, email = $2, phone = $3, address = $4, city = $5, 
          state = $6, pincode = $7, category = $8, status = $9, updated_at = NOW()
      WHERE supplier_id = $10
      RETURNING *
    `;
    
    const result = await pool.query(updateQuery, [
      name,
      email || null,
      phone || null,
      address || null,
      city || null,
      state || null,
      pincode || null,
      category || 'general',
      status || 'active',
      id
    ]);
    
    const updatedSupplier = result.rows[0];
    
    res.json({
      success: true,
      message: 'Supplier updated successfully',
      data: {
        id: updatedSupplier.supplier_id.toString(),
        name: updatedSupplier.name,
        email: updatedSupplier.email || '',
        phone: updatedSupplier.phone || '',
        address: updatedSupplier.address || '',
        city: updatedSupplier.city || '',
        state: updatedSupplier.state || '',
        pincode: updatedSupplier.pincode || '',
        category: updatedSupplier.category || 'general',
        status: updatedSupplier.status || 'active',
        createdAt: updatedSupplier.created_at,
        updatedAt: updatedSupplier.updated_at
      }
    });
    
  } catch (error) {
    console.error('Error updating supplier:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update supplier',
      message: error.message
    });
  }
});

// DELETE supplier (soft delete by marking as inactive)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if supplier exists
    const existingSupplier = await pool.query(
      'SELECT supplier_id FROM suppliers WHERE supplier_id = $1',
      [id]
    );
    
    if (existingSupplier.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Supplier not found'
      });
    }
    
    // Soft delete by marking as inactive
    await pool.query(
      'UPDATE suppliers SET status = $1, updated_at = NOW() WHERE supplier_id = $2',
      ['inactive', id]
    );
    
    res.json({
      success: true,
      message: 'Supplier marked as inactive successfully'
    });
    
  } catch (error) {
    console.error('Error deleting supplier:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete supplier',
      message: error.message
    });
  }
});

// GET supplier categories
router.get('/categories/list', async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT category
      FROM suppliers 
      WHERE category IS NOT NULL
      ORDER BY category ASC
    `;
    
    const result = await pool.query(query);
    
    const categories = result.rows.map(row => row.category);
    
    res.json({
      success: true,
      data: categories
    });
    
  } catch (error) {
    console.error('Error fetching supplier categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch supplier categories',
      message: error.message
    });
  }
});

// GET supplier statistics
router.get('/stats/summary', async (req, res) => {
  try {
    // Total suppliers
    const totalSuppliers = await pool.query('SELECT COUNT(*) as total FROM suppliers');
    
    // Active suppliers
    const activeSuppliers = await pool.query('SELECT COUNT(*) as total FROM suppliers WHERE status = $1', ['active']);
    
    // Inactive suppliers
    const inactiveSuppliers = await pool.query('SELECT COUNT(*) as total FROM suppliers WHERE status = $1', ['inactive']);
    
    // Suppliers by category
    const suppliersByCategory = await pool.query(`
      SELECT 
        category,
        COUNT(*) as count
      FROM suppliers 
      WHERE category IS NOT NULL
      GROUP BY category 
      ORDER BY count DESC
    `);
    
    // Suppliers by city
    const suppliersByCity = await pool.query(`
      SELECT 
        city,
        COUNT(*) as count
      FROM suppliers 
      WHERE city IS NOT NULL
      GROUP BY city 
      ORDER BY count DESC
      LIMIT 10
    `);
    
    // Suppliers by state
    const suppliersByState = await pool.query(`
      SELECT 
        state,
        COUNT(*) as count
      FROM suppliers 
      WHERE state IS NOT NULL
      GROUP BY state 
      ORDER BY count DESC
      LIMIT 10
    `);
    
    // New suppliers this month
    const newSuppliersThisMonth = await pool.query(`
      SELECT COUNT(*) as total
      FROM suppliers 
      WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
    `);
    
    res.json({
      success: true,
      data: {
        totalSuppliers: parseInt(totalSuppliers.rows[0].total),
        activeSuppliers: parseInt(activeSuppliers.rows[0].total),
        inactiveSuppliers: parseInt(inactiveSuppliers.rows[0].total),
        suppliersByCategory: suppliersByCategory.rows,
        suppliersByCity: suppliersByCity.rows,
        suppliersByState: suppliersByState.rows,
        newSuppliersThisMonth: parseInt(newSuppliersThisMonth.rows[0].total)
      }
    });
    
  } catch (error) {
    console.error('Error fetching supplier statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch supplier statistics',
      message: error.message
    });
  }
});

module.exports = router;
