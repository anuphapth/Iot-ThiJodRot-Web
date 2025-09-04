import pg from 'pg';
import dns from 'dns';

const { Pool } = pg;

// บังคับให้ dns.lookup ใช้ IPv4 เท่านั้น
const dnsLookup4 = (hostname, options, callback) => {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  options.family = 4;
  return dns.lookup(hostname, options, callback);
};

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  // Override dns lookup
  dnsLookup: dnsLookup4
});

export default pool;
