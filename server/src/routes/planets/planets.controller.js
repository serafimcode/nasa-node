const { getAllPlanets } = require('../../models/planets');

function httpGetAllPlanets(req, res) {
   res.status(200).json(getAllPlanets());
}

module.exports = {
    httpGetAllPlanets,
}

