const constants = {
    // parking
    newCar: "INSERT INTO parking_logs (slot, time_in) VALUES ($1, $2)",
    carAway: "UPDATE parking_logs SET time_out = $1 WHERE id = (SELECT id FROM (SELECT id FROM parking_logs WHERE slot = $2 AND time_out IS NULL ORDER BY id DESC LIMIT 1) AS sub)",
    getAllLog: "SELECT * FROM parking_logs ORDER BY id DESC",
    getStatus: "SELECT slot , status FROM parking_status ORDER BY id",
    clien: "SELECT slot, CASE WHEN time_out IS NULL THEN 'จอดอยู่' ELSE 'ว่าง' END AS status,time_in, time_out FROM parking_logs WHERE id IN (SELECT MAX(id) FROM parking_logs GROUP BY slot)ORDER BY slot",
    changStatus: "UPDATE parking_status SET status = $1 WHERE slot = $2",
    getStatusCar: "SELECT status FROM parking_status WHERE slot = $1",

    // users
    checkUserName: "SELECT * FROM users WHERE username = $1",

    // dashboard
    getDataDashboard: "SELECT to_char(ts, $1) AS label, COUNT(*) AS total_cars FROM ( SELECT generate_series(time_in, COALESCE(time_out, NOW()), interval '1 hour') AS ts FROM parking_logs WHERE time_in >= $2 AND time_in < $3 ) AS series GROUP BY label ORDER BY label"
}

export default constants;