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

    res.write(`event: connected\ndata: "SSE connected"\n\n`);

    clients.push(res);

    // Clean up when client closes connection
    req.on('close', () => {
        clients = clients.filter(client => client !== res);
    });
};

// ======= Optimized Notifier =======
export const notifyClients = async () => {
    try {
        const { rows } = await db.query(constants.getStatus);
        const data = JSON.stringify(rows);

        clients = clients.filter(client => {
            try {
                client.write(`data: ${data}\n\n`);
                return true;
            } catch (err) {
                return false;
            }
        });
    } catch (error) {
    }
};
