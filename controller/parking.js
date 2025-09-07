import constants from '../lib/constants.js';
import db from '../lib/db.js';
import { notifyClients } from './sse.js';

// Push Data
export const parking = async (req, res) => {
    const { slot, status } = req.body;

    try {
        // check data
        if (isNaN(slot) || isNaN(status)) {
            return res.status(400).json({ message: "Slot or Status incorrect" });
        }

        // check slot must be 0 or 1
        if (slot !== 1 && slot !== 2) {
            return res.status(404).json({ message: "Slot Have only 1 or 2" });
        }

        if (status === 1) {

            // ซ่อมบำรุง
            const fixable = await db.query(constants.getStatusCar, [slot]);
            if (fixable.rows[0].status === 2) {
                return res.status(200).json({ message: "ซ่อมบำรุง" });
            }

            const { rows: existing } = await db.query(constants.checkExit, [slot, status]);

            // check car exit?
            if (existing.length > 0) {
                return res.status(409).json({ message: `Slot ${slot} still have car` });
            }

            await db.query(constants.newCar, [slot, new Date()]);
            await db.query(constants.changStatus, [status, slot]);
            await notifyClients();
            return res.status(201).json({ message: "Get car come on slot " + slot });
        } else if (status === 0) {

            const fixable = await db.query(constants.getStatusCar, [slot]);
            if (fixable.rows[0].status === 2) {
                return res.status(200).json({ message: "ซ่อมบำรุง" });
            }

            // car go away
            const { rows: existing } = await db.query(constants.checkExit, [slot, status]);

            if (existing.length > 0) {
                return res.status(409).json({ message: `There are no cars parked here slot ${slot}` });
            }

            await db.query(constants.carAway, [new Date(), slot]);
            await db.query(constants.changStatus, [status, slot]);
            await notifyClients();
            return res.status(200).json({ message: "Get car out on slot " + slot });
        }
        return res.status(400).json({ message: "Status not 0 or 1" })
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

// get all log
export const parkLog = async (req, res) => {
    const { rows } = await db.query(constants.getAllLog);
    return res.status(200).json(rows);
};

// get last status
export const getParkingStatus = async (req, res) => {
    try {
        const { rows } = await db.query(constants.getStatus);
        console.log(rows)
        return res.status(200).json(rows);
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
};