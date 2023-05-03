if (process.env.USER) require("dotenv").config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const app = express();

//save for routers
const appointmentsRouter = require('./appointments/appointments.router')

const errorHandler = require('./errors/errorHandler');
const notFound = require('./errors/notFound');

app.use(cors());
app.use(express.json());

//save for route with route handlers
app.use('/appointments',appointmentsRouter)

app.use(notFound);
app.use(errorHandler);

module.exports = app;