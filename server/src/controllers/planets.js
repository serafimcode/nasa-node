const { planets } = require('../models/planets');

function getAllPlanets(req, res) {
   res.status(200).json(planets);
}

module.exports = {
    getAllPlanets,
}

