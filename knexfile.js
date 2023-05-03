const path = require('path');
require('dotenv').config();

module.exports = {

  development: {
    client: 'postgresql',
    connection: {
      host : 'localhost',
      user : process.env.DB_USER,
      password : process.env.DB_PASSWORD,
      database : process.env.DB_DEV
    },
    migrations: {
      directory: path.join(__dirname, 'src', 'db', 'migrations'),
    },
    seeds: {
      directory: path.join(__dirname, 'src', 'db', 'seeds'),
    },
  },

  test: {
    client: 'postgresql',
    connection: {
      host : 'localhost',
      user : process.env.DB_USER,
      password : process.env.DB_PASSWORD,
      database : process.env.DB_TEST
    },
    migrations: {
      directory: path.join(__dirname, 'src', 'db', 'migrations'),
    },
    seeds: {
      directory: path.join(__dirname, 'src', 'db', 'seeds'),
    },
  },

  production: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user:     'username',
      password: 'password'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }

};
