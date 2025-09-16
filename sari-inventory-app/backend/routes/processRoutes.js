const express = require('express');
const { pool } = require('../config/database');

const router = express.Router();

// GET live process status for all saris
router.get('/live-status', async (req, res) => {
  try {
    // Get current status of all saris with their latest movement
    const query = `
      SELECT 
        sm.serial_number,
        sm.item_code,
        sm.current_process,
        sm.current_location,
        sm.entry_date,
        ml.movement_date as last_movement_date,
        ml.from_process,
        ml.done_to_process,
        ml.to_location,
        ml.created_at as last_updated
      FROM serial_master sm
      LEFT JOIN LATERAL (
        SELECT 
          movement_date,
          from_process,
          done_to_process,
          to_location,
          created_at
        FROM movement_log 
        WHERE serial_number = sm.serial_number 
        ORDER BY created_at DESC 
        LIMIT 1
      ) ml ON true
      ORDER BY sm.serial_number
    `;

    const result = await pool.query(query);
    
    // Process the data to create live status
    const liveStatus = result.rows.map(row => {
      const processFlow = ['Entry', 'Kora', 'White', 'Self Dyed', 'Contrast Dyed'];
      const currentProcessIndex = processFlow.indexOf(row.current_process);
      
      return {
        serialNumber: row.serial_number,
        itemCode: row.item_code,
        currentProcess: row.current_process,
        currentLocation: row.current_location,
        entryDate: row.entry_date,
        lastMovementDate: row.last_movement_date,
        lastUpdated: row.last_updated,
        processFlow: processFlow.map((process, index) => ({
          name: process,
          status: index <= currentProcessIndex ? 'completed' : 'pending',
          isCurrent: index === currentProcessIndex,
          isActive: index === currentProcessIndex
        })),
        progress: currentProcessIndex >= 0 ? ((currentProcessIndex + 1) / processFlow.length) * 100 : 0
      };
    });

    res.json({
      success: true,
      data: liveStatus,
      total: liveStatus.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching live process status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch live process status',
      message: error.message
    });
  }
});

// GET process statistics
router.get('/statistics', async (req, res) => {
  try {
    // Get process distribution
    const processStats = await pool.query(`
      SELECT 
        current_process,
        COUNT(*) as count,
        COUNT(CASE WHEN current_location IS NOT NULL THEN 1 END) as with_location
      FROM serial_master 
      WHERE current_process IS NOT NULL
      GROUP BY current_process
      ORDER BY 
        CASE current_process
          WHEN 'Kora' THEN 1
          WHEN 'White' THEN 2
          WHEN 'Self Dyed' THEN 3
          WHEN 'Contrast Dyed' THEN 4
          ELSE 5
        END
    `);

    // Get movement statistics
    const movementStats = await pool.query(`
      SELECT 
        done_to_process as process,
        COUNT(*) as movement_count,
        COUNT(DISTINCT serial_number) as unique_serials
      FROM movement_log 
      WHERE done_to_process IS NOT NULL
      GROUP BY done_to_process
      ORDER BY movement_count DESC
    `);

    // Get recent activity (last 24 hours)
    const recentActivity = await pool.query(`
      SELECT 
        COUNT(*) as recent_movements,
        COUNT(DISTINCT serial_number) as active_serials
      FROM movement_log 
      WHERE created_at >= NOW() - INTERVAL '24 hours'
    `);

    res.json({
      success: true,
      data: {
        processDistribution: processStats.rows,
        movementStatistics: movementStats.rows,
        recentActivity: recentActivity.rows[0],
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error fetching process statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch process statistics',
      message: error.message
    });
  }
});

// GET detailed process flow for a specific serial number
router.get('/serial/:serialNumber', async (req, res) => {
  try {
    const { serialNumber } = req.params;

    // Get all movements for this serial number
    const movements = await pool.query(`
      SELECT 
        id,
        movement_date,
        from_process,
        done_to_process,
        from_location,
        to_location,
        quality,
        document_number,
        notes,
        created_at
      FROM movement_log 
      WHERE serial_number = $1
      ORDER BY created_at ASC
    `, [serialNumber]);

    // Get current status
    const currentStatus = await pool.query(`
      SELECT 
        serial_number,
        item_code,
        current_process,
        current_location,
        entry_date
      FROM serial_master 
      WHERE serial_number = $1
    `, [serialNumber]);

    if (currentStatus.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Serial number not found'
      });
    }

    const processFlow = ['Entry', 'Kora', 'White', 'Self Dyed', 'Contrast Dyed'];
    const currentProcessIndex = processFlow.indexOf(currentStatus.rows[0].current_process);

    res.json({
      success: true,
      data: {
        serialNumber,
        currentStatus: currentStatus.rows[0],
        movements: movements.rows,
        processFlow: processFlow.map((process, index) => ({
          name: process,
          status: index <= currentProcessIndex ? 'completed' : 'pending',
          isCurrent: index === currentProcessIndex,
          movement: movements.rows.find(m => m.done_to_process === process)
        })),
        progress: currentProcessIndex >= 0 ? ((currentProcessIndex + 1) / processFlow.length) * 100 : 0
      }
    });

  } catch (error) {
    console.error('Error fetching serial process flow:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch serial process flow',
      message: error.message
    });
  }
});

module.exports = router;
