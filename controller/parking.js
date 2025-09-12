import constants from '../lib/constants.js';
import db from '../lib/db.js';
import { notifyClients } from './sse.js';

// Push Data
export const parking = async (req, res) => {
    const { slot, status } = req.body;

    try {
        // validate input
        const slotNum = Number(slot);
        const statusNum = Number(status);
        if (![1, 2].includes(slotNum) || ![0, 1].includes(statusNum)) {
            return res.status(400).json({ message: "Slot or Status incorrect" });
        }

        // check if slot is under maintenance
        const { rows: fixable } = await db.query(constants.getStatusCar, [slotNum]);
        if (!fixable[0]) {
            return res.status(404).json({ message: "ไม่พบ slot นี้ในระบบ" });
        }
        if (fixable[0].status === 2) {
            return res.status(409).json({ message: "ซ่อมบำรุง" });
        }

        // check current status
        const { rows: existing } = await db.query(constants.getStatusCar, [slotNum]);
        const currentStatus = existing[0]?.status;

        if (currentStatus === undefined) {
            return res.status(404).json({ message: `ไม่พบข้อมูลของ slot ${slotNum}` });
        }

        // get car come
        if (statusNum === 1) {
            if (currentStatus === 1) {
                return res.status(409).json({ message: `Slot ${slotNum} still have car` });
            }

            await Promise.all([
                db.query(constants.newCar, [slotNum, new Date()]),
                db.query(constants.changStatus, [1, slotNum])
            ]);
            await notifyClients();
            return res.status(201).json({ message: `Get car come on slot ${slotNum}` });
        }

        // get car off
        if (statusNum === 0) {
            if (currentStatus === 0) {
                return res.status(400).json({ message: `There are no cars parked here slot ${slotNum}` });
            }

            await Promise.all([
                db.query(constants.carAway, [new Date(), slotNum]),
                db.query(constants.changStatus, [0, slotNum])
            ]);
            await notifyClients();
            return res.status(200).json({ message: `Get car out on slot ${slotNum}` });
        }
        return res.status(400).json({ message: "Invalid status value" });

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
        return res.status(200).json(rows);
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
};