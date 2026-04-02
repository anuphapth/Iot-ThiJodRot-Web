import bcrypt from 'bcrypt';
import UserRepository from '../repositories/userRepository.js';
import { User } from '../models/User.js';
import { UnauthorizedError, NotFoundError } from '../utils/errorHandler.js';
import { validateUserCredentials } from '../utils/validator.js';

export class AuthService {
  constructor() {
    this.userRepository = new UserRepository();
    this.saltRounds = 10;
  }

  async login(username, password) {
    const validatedCredentials = validateUserCredentials(username, password);
    
    // Find user by username
    const user = await this.userRepository.findByUsername(validatedCredentials.username);
    if (!user) {
      throw new UnauthorizedError('Invalid username or password');
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(validatedCredentials.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid username or password');
    }

    // Return user data without password
    return {
      message: 'Login successful',
      user: user.toJSON()
    };
  }

  async logout(req, res) {
    // For session-based authentication
    return new Promise((resolve) => {
      req.session.destroy(() => {
        res.clearCookie('connect.sid');
        resolve({ message: 'Logout successful' });
      });
    });
  }

  async createUser(username, password) {
    const validatedCredentials = validateUserCredentials(username, password);
    
    // Check if user already exists
    const existingUser = await this.userRepository.findByUsername(validatedCredentials.username);
    if (existingUser) {
      throw new Error('Username already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedCredentials.password, this.saltRounds);

    // Create user
    const userData = {
      username: validatedCredentials.username,
      password: hashedPassword,
      created_at: new Date()
    };

    const newUser = await this.userRepository.createUser(userData);
    
    return {
      message: 'User created successfully',
      user: newUser.toJSON()
    };
  }

  async updateUserPassword(userId, oldPassword, newPassword) {
    if (!oldPassword || !newPassword) {
      throw new Error('Old password and new password are required');
    }

    // Validate new password
    validateUserCredentials('temp', newPassword);

    // Get user
    const user = await this.userRepository.getUserById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Verify old password
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      throw new UnauthorizedError('Invalid old password');
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, this.saltRounds);

    // Update password
    const updatedUser = await this.userRepository.updatePassword(userId, hashedNewPassword);
    
    return {
      message: 'Password updated successfully',
      user: updatedUser.toJSON()
    };
  }

  async deleteUser(userId) {
    const user = await this.userRepository.getUserById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    await this.userRepository.deleteUser(userId);
    
    return {
      message: 'User deleted successfully',
      user: user.toJSON()
    };
  }

  async getUserById(userId) {
    const user = await this.userRepository.getUserById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user.toJSON();
  }

  async getAllUsers() {
    const users = await this.userRepository.getAllUsers();
    return users.map(user => user.toJSON());
  }

  hashPassword(password) {
    return bcrypt.hash(password, this.saltRounds);
  }

  async comparePassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }
}

export default AuthService;
