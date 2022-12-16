const express = require('express');
const planets = express.Router();

const { getAllPlanets } = require('../controllers/planets');

planets.get('/planets', getAllPlanets);

module.exports = planets;
