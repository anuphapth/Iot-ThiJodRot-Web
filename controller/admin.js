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
    labelFormat = 'YYYY-MM';
  } else if (type === 'month') {
    const yearInt = parseInt(year);
    const monthInt = parseInt(month);
    const startDateObj = new Date(yearInt, monthInt - 1, 1);
    const endDateObj = new Date(yearInt, monthInt, 1);
    startDate = startDateObj.toISOString().split('T')[0];
    endDate = endDateObj.toISOString().split('T')[0];
    labelFormat = 'YYYY-MM-DD';
  } else {
    return res.status(400).json({ error: 'Invalid type' });
  }

  try {
    const result = await db.query(constants.getdate, [labelFormat, startDate, endDate]);
    res.json(result.rows);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const chart = async (req, res) => {
  const { month, year } = req.query;

  let query = constants.getchart;
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
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getpower = async (req, res) => {
  try {
    // Validate
    const { power } = req.body;
    if (power === undefined) {
      return res.status(400).json({ error: "Missing 'power' in request body" });
    }

    const numpower = Number(power);
    if (isNaN(numpower)) {
      return res.status(400).json({ error: "'power' must be a number" });
    }
    await db.query(constants.getpower, [numpower, new Date()]);
    return res.status(200).json({ message: "Power inserted successfully" });

  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getupPower = async (req, res) => {
    try {
        const avgResult = await db.query(constants.getAvgPower);
        const latestResult = await db.query(constants.getLastPower);

        const averageUse = parseFloat(avgResult.rows[0].average * 5);
        const latestUse = latestResult.rows[0].use * 5;

        return res.status(200).json({ averageUse, latestUse });
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
};