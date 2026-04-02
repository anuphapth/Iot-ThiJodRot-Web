import AuthService from '../services/authService.js';
import { asyncHandler } from '../utils/errorHandler.js';

class UsersController {
  constructor() {
    this.authService = new AuthService();
  }

  login = asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    const result = await this.authService.login(username, password);
    res.status(200).json(result);
  });

  logout = asyncHandler(async (req, res) => {
    const result = await this.authService.logout(req, res);
    res.status(200).json(result);
  });

  createUser = asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    const result = await this.authService.createUser(username, password);
    res.status(201).json(result);
  });

  updateUserPassword = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { oldPassword, newPassword } = req.body;
    const result = await this.authService.updateUserPassword(userId, oldPassword, newPassword);
    res.status(200).json(result);
  });

  getUserById = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const user = await this.authService.getUserById(userId);
    res.json(user);
  });

  getAllUsers = asyncHandler(async (req, res) => {
    const users = await this.authService.getAllUsers();
    res.json(users);
  });

  deleteUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const result = await this.authService.deleteUser(userId);
    res.json(result);
  });
}

export default new UsersController();
