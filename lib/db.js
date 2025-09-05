import dns from 'dns';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  lookup: (hostname, options, callback) => {
    return dns.lookup(hostname, { family: 4 }, callback); // บังคับ resolve IPv4
  }
});

export default pool;
