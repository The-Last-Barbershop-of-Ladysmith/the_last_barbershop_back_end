const path = require('path');
require('dotenv').config();

const {
  DATABASE_URL_DEVELOPMENT, 
  DB_TEST, 
  DB_DEV, 
  DB_PASSWORD, 
  DB_USER
} = process.env;

module.exports = {

  development: {
    client: 'postgresql',
    connection: {
      host : 'localhost',
      user : DB_USER,
      password : DB_PASSWORD,
      database : DB_DEV
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
      user : DB_USER,
      password : DB_PASSWORD,
      database : DB_TEST
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
