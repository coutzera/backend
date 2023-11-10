exports.up = (knex) =>
  knex.schema.createTable("movie_users", (table) => {
    table.increments("id");
    table.text("name");
    table.text("mail");
    table.text("pass");
    table.text("avatar");
    table.timestamp("created_at").default(knex.fn.now());
    table.timestamp("updated_at").default(knex.fn.now());
  });
exports.down = (knex) => knex.schema.dropTable("movie_users");
