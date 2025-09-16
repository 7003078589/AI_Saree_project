const express = require('express');
const { pool } = require('../config/database');

const router = express.Router();

// GET dashboard overview statistics
router.get('/overview', async (req, res) => {
  try {
    // Total saris
    const totalSaris = await pool.query('SELECT COUNT(*) as total FROM serial_master');
    
    // Active saris (all saris are active in your system)
    const activeSaris = await pool.query('SELECT COUNT(*) as total FROM serial_master');
    
    // Rejected saris (not applicable in your current system)
    const rejectedSaris = { rows: [{ total: 0 }] };
    
    // Total movements
    const totalMovements = await pool.query('SELECT COUNT(*) as total FROM movement_log');
    
    // Saris by current process
    const processDistribution = await pool.query(`
      SELECT 
        current_process as process,
        COUNT(*) as count
      FROM serial_master 
      WHERE current_process IS NOT NULL
      GROUP BY current_process 
      ORDER BY count DESC
    `);
    
    // Saris by location
    const locationDistribution = await pool.query(`
      SELECT 
        current_location as location,
        COUNT(*) as count
      FROM serial_master 
      WHERE current_location IS NOT NULL AND current_location != ''
      GROUP BY current_location 
      ORDER BY count DESC
    `);
    
    // Recent movements (last 7 days)
    const recentMovements = await pool.query(`
      SELECT COUNT(*) as total
      FROM movement_log 
      WHERE movement_date >= NOW() - INTERVAL '7 days'
    `);
    
    // New saris added today
    const newSarisToday = await pool.query(`
      SELECT COUNT(*) as total
      FROM serial_master 
      WHERE DATE(entry_date) = CURRENT_DATE
    `);
    
    res.json({
      success: true,
      data: {
        totalSaris: parseInt(totalSaris.rows[0].total),
        activeSaris: parseInt(activeSaris.rows[0].total),
        rejectedSaris: parseInt(rejectedSaris.rows[0].total),
        totalMovements: parseInt(totalMovements.rows[0].total),
        processDistribution: processDistribution.rows,
        locationDistribution: locationDistribution.rows,
        recentMovements: parseInt(recentMovements.rows[0].total),
        newSarisToday: parseInt(newSarisToday.rows[0].total)
      }
    });
    
  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard overview',
      message: error.message
    });
  }
});

// GET production flow statistics
router.get('/production-flow', async (req, res) => {
  try {
    // Saris in each process stage
    const processStages = await pool.query(`
      SELECT 
        current_process as process,
        COUNT(*) as count,
        current_location as location
      FROM serial_master 
      WHERE current_process IS NOT NULL
      GROUP BY current_process, current_location
      ORDER BY 
        CASE current_process
          WHEN 'Kora' THEN 1
          WHEN 'White' THEN 2
          WHEN 'Self Dyed' THEN 3
          WHEN 'Contrast Dyed' THEN 4
          ELSE 5
        END
    `);
    
    // Process completion rates
    const completionRates = await pool.query(`
      SELECT 
        'Kora' as process,
        COUNT(CASE WHEN current_process = 'Kora' THEN 1 END) as in_process,
        COUNT(CASE WHEN current_process IN ('White', 'Self Dyed', 'Contrast Dyed') THEN 1 END) as completed
      FROM serial_master 
      WHERE current_process IS NOT NULL
      
      UNION ALL
      
      SELECT 
        'White' as process,
        COUNT(CASE WHEN current_process = 'White' THEN 1 END) as in_process,
        COUNT(CASE WHEN current_process IN ('Self Dyed', 'Contrast Dyed') THEN 1 END) as completed
      FROM serial_master 
      WHERE current_process IS NOT NULL
      
      UNION ALL
      
      SELECT 
        'Self Dyed' as process,
        COUNT(CASE WHEN current_process = 'Self Dyed' THEN 1 END) as in_process,
        COUNT(CASE WHEN current_process = 'Contrast Dyed' THEN 1 END) as completed
      FROM serial_master 
      WHERE current_process IS NOT NULL
      
      UNION ALL
      
      SELECT 
        'Contrast Dyed' as process,
        COUNT(CASE WHEN current_process = 'Contrast Dyed' THEN 1 END) as in_process,
        0 as completed
      FROM serial_master 
      WHERE current_process IS NOT NULL
    `);
    
    // Daily production trends (last 30 days)
    const dailyTrends = await pool.query(`
      SELECT 
        DATE(movement_date) as date,
        COUNT(*) as movements,
        COUNT(DISTINCT serial_number) as unique_saris
      FROM movement_log 
      WHERE movement_date >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(movement_date)
      ORDER BY date DESC
    `);
    
    res.json({
      success: true,
      data: {
        processStages: processStages.rows,
        completionRates: completionRates.rows,
        dailyTrends: dailyTrends.rows
      }
    });
    
  } catch (error) {
    console.error('Error fetching production flow statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch production flow statistics',
      message: error.message
    });
  }
});

// GET inventory analytics
router.get('/inventory-analytics', async (req, res) => {
  try {
    // Design code distribution
    const designDistribution = await pool.query(`
      SELECT 
        item_code as design_code,
        COUNT(*) as count
      FROM serial_master 
      WHERE item_code IS NOT NULL
      GROUP BY item_code 
      ORDER BY count DESC
      LIMIT 10
    `);
    
    // Current code distribution
    const currentCodeDistribution = await pool.query(`
      SELECT 
        current_code,
        COUNT(*) as count
      FROM serial_master 
      WHERE current_code IS NOT NULL
      GROUP BY current_code 
      ORDER BY count DESC
      LIMIT 10
    `);
    
    // Age analysis (how long saris have been in current process)
    const ageAnalysis = await pool.query(`
      SELECT 
        current_process,
        AVG(EXTRACT(EPOCH FROM (NOW() - entry_date))/86400) as avg_days,
        MIN(EXTRACT(EPOCH FROM (NOW() - entry_date))/86400) as min_days,
        MAX(EXTRACT(EPOCH FROM (NOW() - entry_date))/86400) as max_days
      FROM serial_master 
      WHERE current_process IS NOT NULL
      GROUP BY current_process
    `);
    
    // Location efficiency
    const locationEfficiency = await pool.query(`
      SELECT 
        current_location,
        COUNT(*) as total_saris,
        COUNT(CASE WHEN current_process = 'Contrast Dyed' THEN 1 END) as completed_saris,
        ROUND(
          (COUNT(CASE WHEN current_process = 'Contrast Dyed' THEN 1 END)::float / COUNT(*)::float) * 100, 2
        ) as completion_percentage
      FROM serial_master 
      WHERE current_location IS NOT NULL AND current_location != ''
      GROUP BY current_location
      ORDER BY completion_percentage DESC
    `);
    
    res.json({
      success: true,
      data: {
        designDistribution: designDistribution.rows,
        currentCodeDistribution: currentCodeDistribution.rows,
        ageAnalysis: ageAnalysis.rows,
        locationEfficiency: locationEfficiency.rows
      }
    });
    
  } catch (error) {
    console.error('Error fetching inventory analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch inventory analytics',
      message: error.message
    });
  }
});

// GET recent activities
router.get('/recent-activities', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    // Recent movements
    const recentMovements = await pool.query(`
      SELECT 
        ml.log_id,
        ml.serial_number,
        ml.movement_date,
        ml.from_process,
        ml.to_process,
        ml.location,
        ml.created_at,
        sm.item_code as design_code
      FROM movement_log ml
      JOIN serial_master sm ON ml.serial_number = sm.serial_number
      ORDER BY ml.movement_date DESC
      LIMIT $1
    `, [limit]);
    
    // Recent saris added
    const recentSaris = await pool.query(`
      SELECT 
        serial_number,
        entry_date,
        item_code as design_code,
        current_process,
        current_location
      FROM serial_master 
      ORDER BY entry_date DESC
      LIMIT $1
    `, [limit]);
    
    // Transform data for frontend
    const activities = [];
    
    // Add movements
    recentMovements.rows.forEach(movement => {
      activities.push({
        id: `movement_${movement.log_id}`,
        type: 'movement',
        timestamp: movement.movement_date,
        serialNumber: movement.serial_number,
        designCode: movement.design_code,
        description: `Moved from ${movement.from_process} to ${movement.to_process} at ${movement.location}`,
        createdAt: movement.created_at,
        details: {
          fromProcess: movement.from_process,
          toProcess: movement.to_process,
          location: movement.location
        }
      });
    });
    
    // Add new saris
    recentSaris.rows.forEach(sari => {
      activities.push({
        id: `sari_${sari.serial_number}`,
        type: 'new_sari',
        timestamp: sari.entry_date,
        serialNumber: sari.serial_number,
        designCode: sari.design_code,
        description: `New sari added with design code ${sari.design_code}`,
        details: {
          currentProcess: sari.current_process,
          currentLocation: sari.current_location
        }
      });
    });
    
    // Sort by timestamp and limit
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    activities.splice(limit);
    
    res.json({
      success: true,
      data: activities
    });
    
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent activities',
      message: error.message
    });
  }
});

// GET performance metrics
router.get('/performance-metrics', async (req, res) => {
  try {
    const { period = '7' } = req.query; // days
    
    // Production efficiency
    const productionEfficiency = await pool.query(`
      SELECT 
        COUNT(CASE WHEN current_process = 'Contrast Dyed' THEN 1 END) as completed_saris,
        COUNT(*) as total_saris,
        ROUND(
          (COUNT(CASE WHEN current_process = 'Contrast Dyed' THEN 1 END)::float / COUNT(*)::float) * 100, 2
        ) as completion_rate
      FROM serial_master 
      WHERE current_process IS NOT NULL
    `);
    
    // Process cycle times
    const cycleTimes = await pool.query(`
      WITH process_times AS (
        SELECT 
          serial_number,
          MIN(CASE WHEN to_process = 'Kora' THEN movement_date END) as kora_start,
          MIN(CASE WHEN to_process = 'White' THEN movement_date END) as white_start,
          MIN(CASE WHEN to_process = 'Self' THEN movement_date END) as self_start,
          MIN(CASE WHEN to_process = 'Contrast' THEN movement_date END) as contrast_start
        FROM movement_log
        GROUP BY serial_number
      )
      SELECT 
        'Kora to White' as process_pair,
        AVG(EXTRACT(EPOCH FROM (white_start - kora_start))/3600) as avg_hours
      FROM process_times 
      WHERE kora_start IS NOT NULL AND white_start IS NOT NULL
      
      UNION ALL
      
      SELECT 
        'White to Self' as process_pair,
        AVG(EXTRACT(EPOCH FROM (self_start - white_start))/3600) as avg_hours
      FROM process_times 
      WHERE white_start IS NOT NULL AND self_start IS NOT NULL
      
      UNION ALL
      
      SELECT 
        'Self to Contrast' as process_pair,
        AVG(EXTRACT(EPOCH FROM (contrast_start - self_start))/3600) as avg_hours
      FROM process_times 
      WHERE self_start IS NOT NULL AND contrast_start IS NOT NULL
    `);
    
    // Daily throughput
    const dailyThroughput = await pool.query(`
      SELECT 
        DATE(movement_date) as date,
        COUNT(*) as total_movements,
        COUNT(DISTINCT serial_number) as unique_saris
      FROM movement_log 
      WHERE movement_date >= NOW() - INTERVAL '${period} days'
      GROUP BY DATE(movement_date)
      ORDER BY date DESC
    `);
    
    // Rejection rate (not applicable in your current system)
    const rejectionRate = { rows: [{ rejected_count: 0, total_count: 0, rejection_rate: 0 }] };
    
    res.json({
      success: true,
      data: {
        productionEfficiency: productionEfficiency.rows[0],
        cycleTimes: cycleTimes.rows,
        dailyThroughput: dailyThroughput.rows,
        rejectionRate: rejectionRate.rows[0]
      }
    });
    
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch performance metrics',
      message: error.message
    });
  }
});

// GET search suggestions
router.get('/search-suggestions', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.length < 2) {
      return res.json({
        success: true,
        data: {
          serialNumbers: [],
          designCodes: [],
          locations: []
        }
      });
    }
    
    // Search serial numbers
    const serialNumbers = await pool.query(`
      SELECT DISTINCT serial_number
      FROM serial_master 
      WHERE serial_number ILIKE $1
      LIMIT 10
    `, [`%${query}%`]);
    
    // Search design codes
    const designCodes = await pool.query(`
      SELECT DISTINCT item_code as design_code
      FROM serial_master 
      WHERE item_code ILIKE $1
      LIMIT 10
    `, [`%${query}%`]);
    
    // Search locations
    const locations = await pool.query(`
      SELECT DISTINCT current_location
      FROM serial_master 
      WHERE current_location ILIKE $1
      LIMIT 10
    `, [`%${query}%`]);
    
    res.json({
      success: true,
      data: {
        serialNumbers: serialNumbers.rows.map(row => row.serial_number),
        designCodes: designCodes.rows.map(row => row.design_code),
        locations: locations.rows.map(row => row.current_location)
      }
    });
    
  } catch (error) {
    console.error('Error fetching search suggestions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch search suggestions',
      message: error.message
    });
  }
});

module.exports = router;
