const methodNotAllowed = require('../errors/methodNotAllowed')
const router = require('express').Router();
const controller = require('./appointments.controller');

router
  .route('/')
  .post(controller.create)
  .all(methodNotAllowed);

module.exports = router