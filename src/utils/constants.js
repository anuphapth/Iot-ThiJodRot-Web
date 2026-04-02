export const SQL_QUERIES = {
  // parking
  NEW_CAR: "INSERT INTO parking_logs (slot, time_in) VALUES ($1, $2)",
  CAR_AWAY: "UPDATE parking_logs SET time_out = $1 WHERE id = (SELECT id FROM (SELECT id FROM parking_logs WHERE slot = $2 AND time_out IS NULL ORDER BY id DESC LIMIT 1) AS sub)",
  GET_ALL_LOG: "SELECT * FROM parking_logs ORDER BY id DESC",
  GET_STATUS: "SELECT slot, status FROM parking_status ORDER BY id",
  GET_CLIENT_STATUS: "SELECT slot, CASE WHEN time_out IS NULL THEN 'จอดอยู่' ELSE 'ว่าง' END AS status, time_in, time_out FROM parking_logs WHERE id IN (SELECT MAX(id) FROM parking_logs GROUP BY slot) ORDER BY slot",
  CHANGE_STATUS: "UPDATE parking_status SET status = $1 WHERE slot = $2",
  GET_STATUS_CAR: "SELECT status FROM parking_status WHERE slot = $1",
  GET_ACTIVE_LOG: "SELECT * FROM parking_logs WHERE slot = $1 AND time_out IS NULL ORDER BY id DESC LIMIT 1",
  GET_LOGS_BY_DATE_RANGE: "SELECT * FROM parking_logs WHERE time_in >= $1 AND time_in < $2 ORDER BY time_in DESC",
  GET_CHART_DATA: "SELECT slot, time_in, time_out FROM parking_logs WHERE time_in >= $1 AND time_in < $2 AND time_in IS NOT NULL AND time_out IS NOT NULL ORDER BY time_in ASC",

  // users
  CHECK_USERNAME: "SELECT * FROM users WHERE username = $1",
  GET_USER_BY_ID: "SELECT * FROM users WHERE id = $1",
  GET_ALL_USERS: "SELECT * FROM users ORDER BY created_at DESC",

  // dashboard
  GET_DATA_DASHBOARD: "SELECT to_char(ts, $1) AS label, COUNT(*) AS total_cars FROM (SELECT generate_series(time_in, COALESCE(time_out, NOW()), interval '1 hour') AS ts FROM parking_logs WHERE time_in >= $2 AND time_in < $3) AS series GROUP BY label ORDER BY label",
  GET_DATE: "SELECT to_char(ts, $1) AS label, COUNT(*) AS total_cars FROM (SELECT generate_series(time_in, COALESCE(time_out, NOW()), interval '1 hour') AS ts FROM parking_logs WHERE time_in >= $2 AND time_in < $3) AS series GROUP BY label ORDER BY label",
  GET_CHART: "SELECT slot, time_in, time_out FROM parking_logs WHERE time_in IS NOT NULL AND time_out IS NOT NULL",
  INSERT_POWER: "INSERT INTO power (use, created_at) VALUES ($1, $2)",
  GET_AVG_POWER: "SELECT AVG(use) AS average FROM power",
  GET_LAST_POWER: "SELECT use FROM power ORDER BY id DESC LIMIT 1",
  GET_ALL_POWER: "SELECT * FROM power ORDER BY created_at DESC LIMIT $1",
  GET_POWER_BY_DATE_RANGE: "SELECT * FROM power WHERE created_at >= $1 AND created_at < $2 ORDER BY created_at ASC",
  GET_POWER_STATS: "SELECT COUNT(*) as total_readings, AVG(use) as average_power, MIN(use) as min_power, MAX(use) as max_power FROM power WHERE created_at >= $1 AND created_at < $2",
  DELETE_OLD_POWER: "DELETE FROM power WHERE created_at < $1 RETURNING *",
};

export const PARKING_STATUS = {
  VACANT: 0,
  OCCUPIED: 1,
  MAINTENANCE: 2
};

export const PARKING_STATUS_TEXT = {
  [PARKING_STATUS.VACANT]: 'ว่าง',
  [PARKING_STATUS.OCCUPIED]: 'ไม่ว่าง',
  [PARKING_STATUS.MAINTENANCE]: 'ซ่อมบำรุง'
};

export const VALID_SLOTS = [1, 2];

export default {
  SQL_QUERIES,
  PARKING_STATUS,
  PARKING_STATUS_TEXT,
  VALID_SLOTS
};
