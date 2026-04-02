import { BaseRepository } from './baseRepository.js';
import { SQL_QUERIES } from '../utils/constants.js';
import { User } from '../models/User.js';

export class UserRepository extends BaseRepository {
  async findByUsername(username) {
    const result = await this.findOne(SQL_QUERIES.CHECK_USERNAME, [username]);
    return result ? new User(result) : null;
  }

  async createUser(userData) {
    const result = await this.create('users', userData);
    return new User(result);
  }

  async updateUser(id, userData) {
    const result = await this.update('users', userData, 'id = $1', [id]);
    return result ? new User(result) : null;
  }

  async deleteUser(id) {
    const result = await this.delete('users', 'id = $1', [id]);
    return result ? new User(result) : null;
  }

  async getUserById(id) {
    const result = await this.findOne(SQL_QUERIES.GET_USER_BY_ID, [id]);
    return result ? new User(result) : null;
  }

  async getAllUsers() {
    const results = await this.findMany(SQL_QUERIES.GET_ALL_USERS);
    return results.map(row => new User(row));
  }

  async updatePassword(userId, hashedPassword) {
    const result = await this.update('users', { password: hashedPassword }, 'id = $1', [userId]);
    return result ? new User(result) : null;
  }
}

export default UserRepository;
