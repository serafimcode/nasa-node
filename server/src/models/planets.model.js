const parse = require('csv-parse');
const fs = require('fs');
const path = require('path');

const planetsDatabase = require('./planets.mongo');

function isHabitablePlanet(planet) {
    return planet['koi_disposition'] === 'CONFIRMED'
        && planet['koi_insol'] > 0.36 && planet['koi_insol'] < 1.11
        && planet['koi_prad'] < 1.6;
}

function loadPlanetsData() {
    return new Promise((resolve, reject) => {
        fs.createReadStream(path.join(__dirname, '..', '..', 'data', 'kepler_data.csv'))
            .pipe(parse({
                comment: '#',
                columns: true,
            }))
            .on('data', async (data) => {
                if (isHabitablePlanet(data)) {
                    savePlanet(data);
                }
            })
            .on('error', (err) => {
                console.log(err);
                reject(err);
            })
            .on('end', async () => {
                const foundPlanets = await getAllPlanets();
                console.log(`${ foundPlanets.length } habitable planets found!`);
                resolve();
            });
    })
}

async function getAllPlanets() {
    return await planetsDatabase.find({}, {
        '__v': 0,
        '_id': 0
    });
}

async function savePlanet(planet) {
    // upsert = insert + update
    // "upsert" add document only if document doesn't exist in DB
    try {
        await planetsDatabase.updateOne({
            keplerName: planet.kepler_name
        }, {
            keplerName: planet.kepler_name
        }, {
            upsert: true
        });
    } catch (err) {
        console.error(`Could not save a planet ${err}`);
    }
}

module.exports = {
    loadPlanetsData,
    getAllPlanets
};