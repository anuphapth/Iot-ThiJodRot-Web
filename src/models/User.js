export class User {
  constructor(data = {}) {
    this.id = data.id;
    this.username = data.username;
    this.password = data.password; // hashed password
    this.createdAt = data.created_at || data.createdAt;
  }

  static isValidUsername(username) {
    return username && username.length >= 3 && username.length <= 50;
  }

  static isValidPassword(password) {
    return password && password.length >= 6;
  }

  toJSON() {
    return {
      id: this.id,
      username: this.username,
      createdAt: this.createdAt
      // Note: password is not included in JSON response
    };
  }
}

export default User;
