const axios = require('axios');

const launchesDatabase = require('./launches.mongo');
const planetsDatabase = require('./planets.mongo');

const DEFAULT_FLIGHT_NUMBER = 100;
const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query';

async function populateLaunches() {
    console.log('Downloading SpaceX launch data...');
    const response = await axios.post(SPACEX_API_URL, {
        query: {},
        options: {
            pagination: false,
            populate: [
                {
                    path: 'rocket',
                    select: {
                        name: 1
                    }
                },
                {
                    path: 'payloads',
                    select: {
                        customers: 1
                    }
                }
            ]
        }
    }, {
        /**Workaround for https://github.com/axios/axios/issues/5346*/
        headers: { "Accept-Encoding": "gzip,deflate,compress" }
    });

    if (response.status !== 200) {
        console.log('Problem downloading launch data');
        throw new Error('Launch data download failed');
    }
    const launchDocs = response.data.docs;
    for (const launchDoc of launchDocs) {
        const payloads = launchDoc['payloads'];
        const customers = payloads.flatMap((payload) => {
            return payload['customers'];
        });

        const launch = {
            flightNumber: launchDoc['flight_number'],
            mission: launchDoc['name'],
            rocket: launchDoc['rocket']['name'],
            launchDate: launchDoc['date_local'],
            upcoming: launchDoc['upcoming'],
            success: launchDoc['success'],
            customers: customers
        }
        console.log(`${ launch.flightNumber } ${ launch.mission }`);

        await saveLaunch(launch);
    }
}
async function loadLaunchesData() {
    const firstLaunch = await findLaunch({
        flightNumber: 1,
        rocket: 'Falcon 1',
        mission: 'FalconSat'
    });
    if (firstLaunch) {
        console.log('Launch data already loaded')
    } else {
        await populateLaunches();
    }
}

async function findLaunch(filter) {
    return await launchesDatabase.findOne(filter);
}
async function existLaunchWithId(launchId) {
    return await findLaunch({ flightNumber: launchId });
}

async function getLatestFlightNumber() {
    const latestLaunch = await launchesDatabase
        .findOne()
        .sort('-flightNumber');

    if (!latestLaunch) {
        return DEFAULT_FLIGHT_NUMBER;
    }

    return latestLaunch.flightNumber;
}

async function getAllLaunches(skip, limit) {
    return await launchesDatabase
        .find({}, { '_id': 0, '__v': 0 })
        .sort({ flightNumber: 1 })
        .skip(skip)
        .limit(limit);
}

async function saveLaunch(launch) {
    // findOneAndUpdate - returns only those properties which we explicitly set
    // updateOne - returns internal field $setOnInsert
    await launchesDatabase.findOneAndUpdate({
        flightNumber: launch.flightNumber
    }, launch, { upsert: true })
}


async function scheduleNewLaunch(launch) {
    const planetExist = await planetsDatabase.exists({ keplerName: launch.target });
    if (!planetExist) {
        throw new Error('No matching planet found');
    }

    const newFlightNumber = await getLatestFlightNumber() + 1;
    const newLaunch = Object.assign(launch, {
        success: true,
        upcoming: true,
        customers: ['NASA', 'Space-X'],
        flightNumber: newFlightNumber
    });

    await saveLaunch(newLaunch);
}

async function abortLaunchById(id) {
    const aborted = await launchesDatabase.updateOne({
        flightNumber: id
    }, {
        upcoming: false,
        success: false
    });
    return aborted.acknowledged && aborted.modifiedCount === 1;
}

module.exports = {
    loadLaunchesData,
    existLaunchWithId,
    getAllLaunches,
    scheduleNewLaunch,
    abortLaunchById
};