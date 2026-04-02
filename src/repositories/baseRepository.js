import db from '../config/database.js';

export class BaseRepository {
  constructor() {
    this.db = db;
  }

  async query(sql, params = []) {
    try {
      const result = await this.db.query(sql, params);
      return result;
    } catch (error) {
      throw new Error(`Database query failed: ${error.message}`);
    }
  }

  async findOne(sql, params = []) {
    const result = await this.query(sql, params);
    return result.rows[0] || null;
  }

  async findMany(sql, params = []) {
    const result = await this.query(sql, params);
    return result.rows;
  }

  async create(table, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
    
    const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`;
    return this.findOne(sql, values);
  }

  async update(table, data, whereClause, whereParams) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');
    
    const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause} RETURNING *`;
    const allParams = [...values, ...whereParams];
    
    return this.findOne(sql, allParams);
  }

  async delete(table, whereClause, whereParams) {
    const sql = `DELETE FROM ${table} WHERE ${whereClause} RETURNING *`;
    const result = await this.query(sql, whereParams);
    return result.rows[0] || null;
  }

  async transaction(callback) {
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

export default BaseRepository;
