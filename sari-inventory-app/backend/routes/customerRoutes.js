const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');

const router = express.Router();

// Validation middleware
const validateCustomer = [
  body('name').notEmpty().withMessage('Customer name is required'),
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('phone').optional().isMobilePhone().withMessage('Invalid phone number format')
];

// GET all customers with pagination and search
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
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
        created_at,
        updated_at
      FROM customers
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
    
    // Add pagination
    paramCount++;
    query += ` ORDER BY name ASC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    queryParams.push(limit, offset);
    
    const result = await pool.query(query, queryParams);
    
    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM customers
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
    
    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);
    
    // Transform data for frontend
    const customers = result.rows.map(row => ({
      id: row.customer_id.toString(),
      name: row.name,
      email: row.email || '',
      phone: row.phone || '',
      address: row.address || '',
      city: row.city || '',
      state: row.state || '',
      pincode: row.pincode || '',
      status: row.status || 'active',
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
    
    res.json({
      success: true,
      data: customers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch customers',
      message: error.message
    });
  }
});

// GET customer by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
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
        created_at,
        updated_at
      FROM customers
      WHERE customer_id = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }
    
    const customer = result.rows[0];
    
    res.json({
      success: true,
      data: {
        id: customer.customer_id.toString(),
        name: customer.name,
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        city: customer.city || '',
        state: customer.state || '',
        pincode: customer.pincode || '',
        status: customer.status || 'active',
        createdAt: customer.created_at,
        updatedAt: customer.updated_at
      }
    });
    
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch customer',
      message: error.message
    });
  }
});

// POST create new customer
router.post('/', validateCustomer, async (req, res) => {
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
      status = 'active'
    } = req.body;
    
    // Check if customer with same email or phone already exists
    if (email) {
      const existingEmail = await pool.query(
        'SELECT customer_id FROM customers WHERE email = $1',
        [email]
      );
      
      if (existingEmail.rows.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Customer with this email already exists'
        });
      }
    }
    
    if (phone) {
      const existingPhone = await pool.query(
        'SELECT customer_id FROM customers WHERE phone = $1',
        [phone]
      );
      
      if (existingPhone.rows.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Customer with this phone number already exists'
        });
      }
    }
    
    // Insert new customer
    const insertQuery = `
      INSERT INTO customers (
        name, email, phone, address, city, state, pincode, status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
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
      status
    ]);
    
    const newCustomer = result.rows[0];
    
    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: {
        id: newCustomer.customer_id.toString(),
        name: newCustomer.name,
        email: newCustomer.email || '',
        phone: newCustomer.phone || '',
        address: newCustomer.address || '',
        city: newCustomer.city || '',
        state: newCustomer.state || '',
        pincode: newCustomer.pincode || '',
        status: newCustomer.status || 'active',
        createdAt: newCustomer.created_at,
        updatedAt: newCustomer.updated_at
      }
    });
    
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create customer',
      message: error.message
    });
  }
});

// PUT update customer
router.put('/:id', validateCustomer, async (req, res) => {
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
      status
    } = req.body;
    
    // Check if customer exists
    const existingCustomer = await pool.query(
      'SELECT customer_id FROM customers WHERE customer_id = $1',
      [id]
    );
    
    if (existingCustomer.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }
    
    // Check if email/phone conflicts with other customers
    if (email) {
      const existingEmail = await pool.query(
        'SELECT customer_id FROM customers WHERE email = $1 AND customer_id != $2',
        [email, id]
      );
      
      if (existingEmail.rows.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Email already exists with another customer'
        });
      }
    }
    
    if (phone) {
      const existingPhone = await pool.query(
        'SELECT customer_id FROM customers WHERE phone = $1 AND customer_id != $2',
        [phone, id]
      );
      
      if (existingPhone.rows.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Phone number already exists with another customer'
        });
      }
    }
    
    // Update customer
    const updateQuery = `
      UPDATE customers 
      SET name = $1, email = $2, phone = $3, address = $4, city = $5, 
          state = $6, pincode = $7, status = $8, updated_at = NOW()
      WHERE customer_id = $9
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
      status || 'active',
      id
    ]);
    
    const updatedCustomer = result.rows[0];
    
    res.json({
      success: true,
      message: 'Customer updated successfully',
      data: {
        id: updatedCustomer.customer_id.toString(),
        name: updatedCustomer.name,
        email: updatedCustomer.email || '',
        phone: updatedCustomer.phone || '',
        address: updatedCustomer.address || '',
        city: updatedCustomer.city || '',
        state: updatedCustomer.state || '',
        pincode: updatedCustomer.pincode || '',
        status: updatedCustomer.status || 'active',
        createdAt: updatedCustomer.created_at,
        updatedAt: updatedCustomer.updated_at
      }
    });
    
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update customer',
      message: error.message
    });
  }
});

// DELETE customer (soft delete by marking as inactive)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if customer exists
    const existingCustomer = await pool.query(
      'SELECT customer_id FROM customers WHERE customer_id = $1',
      [id]
    );
    
    if (existingCustomer.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }
    
    // Soft delete by marking as inactive
    await pool.query(
      'UPDATE customers SET status = $1, updated_at = NOW() WHERE customer_id = $2',
      ['inactive', id]
    );
    
    res.json({
      success: true,
      message: 'Customer marked as inactive successfully'
    });
    
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete customer',
      message: error.message
    });
  }
});

// GET customer statistics
router.get('/stats/summary', async (req, res) => {
  try {
    // Total customers
    const totalCustomers = await pool.query('SELECT COUNT(*) as total FROM customers');
    
    // Active customers
    const activeCustomers = await pool.query('SELECT COUNT(*) as total FROM customers WHERE status = $1', ['active']);
    
    // Inactive customers
    const inactiveCustomers = await pool.query('SELECT COUNT(*) as total FROM customers WHERE status = $1', ['inactive']);
    
    // Customers by city
    const customersByCity = await pool.query(`
      SELECT 
        city,
        COUNT(*) as count
      FROM customers 
      WHERE city IS NOT NULL
      GROUP BY city 
      ORDER BY count DESC
      LIMIT 10
    `);
    
    // Customers by state
    const customersByState = await pool.query(`
      SELECT 
        state,
        COUNT(*) as count
      FROM customers 
      WHERE state IS NOT NULL
      GROUP BY state 
      ORDER BY count DESC
      LIMIT 10
    `);
    
    // New customers this month
    const newCustomersThisMonth = await pool.query(`
      SELECT COUNT(*) as total
      FROM customers 
      WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
    `);
    
    res.json({
      success: true,
      data: {
        totalCustomers: parseInt(totalCustomers.rows[0].total),
        activeCustomers: parseInt(activeCustomers.rows[0].total),
        inactiveCustomers: parseInt(inactiveCustomers.rows[0].total),
        customersByCity: customersByCity.rows,
        customersByState: customersByState.rows,
        newCustomersThisMonth: parseInt(newCustomersThisMonth.rows[0].total)
      }
    });
    
  } catch (error) {
    console.error('Error fetching customer statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch customer statistics',
      message: error.message
    });
  }
});

module.exports = router;
