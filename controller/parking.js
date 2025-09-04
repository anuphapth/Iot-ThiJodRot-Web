import constants from '../lib/constants.js';
import db from '../lib/db.js';

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
            const { rows: existing } = await db.query(constants.checkExit, [slot]);

            // check car exit?
            if (existing.length > 0) {
                return res.status(409).json({ message: `Slot ${slot} still have car` });
            }

            await db.query(constants.newCar, [slot, new Date()]);
            await notifyClients();
            return res.status(201).json({ message: "Get car come on slot " + slot });
        } else if (status === 0) {
            // car go away
            const result = await db.query(constants.carAway, [new Date(), slot]);

            if (result.rowCount === 0) {
                return res.status(404).json({ message: "There are no cars parked here" });
            }

            await notifyClients();
            return res.status(200).json({ message: "Get car out on slot " + slot });

        }
        return res.status(400).json({ message: "Status not 0 or 1" })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ err: "Internal Server Error" });
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
        console.error("Error getParkingStatus:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};


let clients = [];
export const subscribeParkingStatus = (req, res) => {
    // set Header SSE Make browser long-lived HTTP connection and flush sure to res now 
    res.set({ 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive', });
    res.flushHeaders();

    // push all clients still in browser
    clients.push(res);

    // pop clints out when they left
    req.on('close', () => { clients = clients.filter(client => client !== res); });
};

export const notifyClients = async () => {
    const { rows } = await db.query(constants.clien);

    const data = JSON.stringify(rows);
    // sent data cliients still in browser
    clients.forEach(res => res.write(`data: ${data}\n\n`));
};