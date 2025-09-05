import db from '../lib/db.js';
import constants from '../lib/constants.js';

let clients = [];

export const subscribeParkingStatus = (req, res) => {
    res.set({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });
    res.flushHeaders();

    clients.push(res);

    req.on('close', () => {
        clients = clients.filter(client => client !== res);
    });
};

export const notifyClients = async () => {
    try {
        const { rows } = await db.query(constants.getStatus);
        const data = JSON.stringify(rows);

        clients.forEach(client => client.write(`data: ${data}\n\n`));
    } catch (error) {
        return res.status(500).json({ err: "Internal Server Error" });
    }
};