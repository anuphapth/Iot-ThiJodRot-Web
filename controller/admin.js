import constants from '../lib/constants.js';
import db from '../lib/db.js';
import { notifyClients } from './sse.js';

export const controllPark = async (req, res) => {
  const { slot, status } = req.body;

  // check data
  if (isNaN(slot) || isNaN(status)) {
    return res.status(400).json({ message: "Slot or Status incorrect" });
  }

  // check slot must be 0 or 1
  if (slot !== 1 && slot !== 2) {
    return res.status(404).json({ message: "Slot Have only 1 or 2" });
  }

  try {
    if (status === 2) {

      // check status befor
      const result = await db.query(constants.getStatusCar, [slot]);
      if (result.rows[0].status === 2) {
        return res.status(400).json({ message: "status already 2" });
      }

      // chang status to fix and get off car
      await db.query(constants.carAway, [new Date(), slot]);
      await db.query(constants.changStatus, [status, slot]);
      await notifyClients();
      return res.status(200).json({ message: "Fixble" });
    } else if (status === 0) {

      // check status befor
      const result = await db.query(constants.getStatusCar, [slot]);
      if (result.rows[0].status === 0) {
        return res.status(400).json({ message: "status already 0" });
      }

      // chang status to ready
      await db.query(constants.changStatus, [status, slot]);
      await notifyClients();
      return res.status(200).json({ message: "Ready" })
    }
    return res.status(400).json({ message: "Status not 0 or 2" })
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export const parkingData = async (req, res) => {
  const { type, year, month } = req.query;

  let startDate, endDate, labelFormat;

  if (type === 'year') {
    startDate = `${year}-01-01`;
    endDate = `${parseInt(year) + 1}-01-01`;
    labelFormat = 'YYYY-MM'; // รายเดือน
  } else if (type === 'month') {
    const yearInt = parseInt(year);
    const monthInt = parseInt(month);

    const startDateObj = new Date(yearInt, monthInt - 1, 1); // วันที่ 1 ของเดือน
    const endDateObj = new Date(yearInt, monthInt, 1);       // วันที่ 1 ของเดือนถัดไป

    startDate = startDateObj.toISOString().split('T')[0];
    endDate = endDateObj.toISOString().split('T')[0];
    labelFormat = 'YYYY-MM-DD'; // รายวัน
  } else {
    return res.status(400).json({ error: 'Invalid type' });
  }

  const query = `
    SELECT
      to_char(ts, $1) AS label,
      COUNT(*) AS total_cars
    FROM (
      SELECT generate_series(time_in, COALESCE(time_out, NOW()), interval '1 hour') AS ts
      FROM parking_logs
      WHERE time_in >= $2 AND time_in < $3
    ) AS series
    GROUP BY label
    ORDER BY label;
  `;

  try {
    const result = await db.query(query, [labelFormat, startDate, endDate]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
}

export const chart = async (req, res) => {
  const { month, year } = req.query;

  let query = `
    SELECT slot, time_in, time_out
    FROM parking_logs
    WHERE time_in IS NOT NULL AND time_out IS NOT NULL
  `;
  const params = [];

  if (year) {
    params.push(year);
    query += ` AND EXTRACT(YEAR FROM time_in) = $${params.length}`;
  }

  if (month) {
    params.push(month);
    query += ` AND EXTRACT(MONTH FROM time_in) = $${params.length}`;
  }

  query += ` ORDER BY time_in ASC`;

  try {
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error in /api/parking/logs:', err);
    res.status(500).json({ error: 'Database error' });
  }
}