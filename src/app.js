if (process.env.USER) require("dotenv").config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const app = express();

//save for routers

const errorHandler = require('./errors/errorHandler');
const notFound = require('./errors/notFound');

app.use(cors());
app.use(express.json());

//save for route with route handlers

app.use(errorHandler);
app.use(notFound);
