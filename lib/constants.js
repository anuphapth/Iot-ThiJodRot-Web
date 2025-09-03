const constants = {
    checkExit: "SELECT * FROM parking_logs WHERE slot = ? AND time_out IS NULL",
    newCar: "INSERT INTO parking_logs (slot, time_in) VALUES (?, ?)",
    carAway: "UPDATE parking_logs SET time_out = ? WHERE id = (SELECT id FROM (SELECT id FROM parking_logs WHERE slot = ? AND time_out IS NULL ORDER BY id DESC LIMIT 1) AS sub)",
    getAllLog: "SELECT * FROM parking_logs ORDER BY id DESC",
    getStatus: "SELECT slot, CASE WHEN time_out IS NULL THEN 'จอดอยู่' ELSE 'ว่าง' END AS status,time_in,time_out FROM parking_logs WHERE id IN (SELECT MAX(id) FROM parking_logs GROUP BY slot)ORDER BY slot",
    clien: "SELECT slot, CASE WHEN time_out IS NULL THEN 'จอดอยู่' ELSE 'ว่าง' END AS status,time_in, time_out FROM parking_logs WHERE id IN (SELECT MAX(id) FROM parking_logs GROUP BY slot)ORDER BY slot",
}

export default constants;