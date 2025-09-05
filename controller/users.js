import bcrypt from 'bcrypt';
import constants from '../lib/constants.js';
import db from '../lib/db.js';

export const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await db.query(constants.checkUserName, [username]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        return res.status(200).json({ message: 'Login successful' });
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}