const methodNotAllowed = require('../errors/methodNotAllowed')
const router = require('express').Router();
const controller = require('./appointments.controller');
const validate = require('./appointments.validation')

router
  .route('/')
  .post(validate.create, controller.create)
  .all(methodNotAllowed);

module.exports = router