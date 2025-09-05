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
            // chang status to fixable
            const result = await db.query(constants.getStatusCar, [slot]);

            if (result.rows[0].status === 2) {
                return res.status(400).json({ message: "status already 2" });
            }

            await db.query(constants.carAway, [new Date(), slot]);
            await db.query(constants.changStatus, [status, slot]);
            await notifyClients();
            return res.status(200).json({ message: "สถานะซ่อมบำรุง" });
        } else if (status === 0) {
            // chang status to free
            const result = await db.query(constants.getStatusCar, [slot]);
            if (result.rows[0].status === 0) {
                return res.status(400).json({ message: "status already 0" });
            }

            await db.query(constants.changStatus, [status, slot]);
            await notifyClients();
            return res.status(200).json({ message: "สถานะพร้อมจอด" })
        }
        return res.status(400).json({ message: "Status not 0 or 2" })
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
}