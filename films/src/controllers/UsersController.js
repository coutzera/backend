const { hash, compare } = require("bcryptjs");
const AppError = require("../utils/AppError");

const sqliteConnection = require("../database/sqlite");
class UsersController {
  async create(request, response) {
    const { name, mail, pass } = request.body;

    const database = await sqliteConnection();
    const checkUserExists = await database.get(
      "SELECT * FROM users WHERE mail = (?)",
      [mail]
    );

    if (checkUserExists) {
      throw new AppError("Este e-mail já está em uso.");
    }

    const hashedPassword = await hash(pass, 8);

    await database.run("INSERT INTO users (name, mail, pass) VALUES (?,?,?)", [
      name,
      mail,
      hashedPassword,
    ]);
    return response.status(201).json();
  }

  async update(request, response) {
    const { name, mail, pass, old_pass } = request.body;
    const { id } = request.params;

    const database = await sqliteConnection();
    const user = await database.get("SELECT * FROM users WHERE id = (?)", [id]);

    if (!user) {
      throw new AppError("Usuário não encontrado.");
    }

    const userWithUpdatedMail = await database.get(
      "SELECT * FROM users WHERE mail = (?)",
      [mail]
    );

    if (userWithUpdatedMail && userWithUpdatedMail.id !== id) {
      throw new AppError("Este e-mail já está em uso!");
    }

    user.name = name ?? user.name;
    user.mail = mail ?? user.mail;

    if (pass && !old_pass) {
      throw new AppError(
        "Você precisa informar a senha antiga para definir a nova senha."
      );
    }

    if (pass && old_pass) {
      const checkOldPass = await compare(old_pass, user.pass);

      if (!checkOldPass) {
        throw new AppError("A senha antiga não confere.");
      }

      user.pass = await hash(pass, 8);
    }

    await database.run(
      `
    UPDATE users SET
    name = ?,
    mail = ?,
    pass = ?,
    updated_at = DATETIME('now')
    WHERE id = ?`,
      [user.name, user.mail, user.pass, id]
    );

    return response.status(200).json();
  }
}

module.exports = UsersController;
