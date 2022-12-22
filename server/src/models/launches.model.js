const launchesDatabase = require('./launches.mongo');
const planetsDatabase = require('./planets.mongo');

const DEFAULT_FLIGHT_NUMBER = 100;

const launch = {
    flightNumber: 100,
    mission: 'Kepler Exploration X',
    rocket: 'Explorer IS1',
    launchDate: new Date('December 27, 2030'),
    target: 'Kepler-442 b',
    customers: ['NASA', 'Space-X'],
    upcoming: true,
    success: true
}
saveLaunch(launch);
async function existLaunchWithId(launchId) {
    return await launchesDatabase.exists({ flightNumber: launchId });
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
async function getAllLaunches() {
    return await launchesDatabase.find({}, { '_id': 0, '__v':0 });
}

async function saveLaunch(launch) {
    const planetExist = await planetsDatabase.exists({ keplerName: launch.target });
    if (!planetExist) {
        throw new Error('No matching planet found');
    }
    // findOneAndUpdate - returns only those properties which we explicitly set
    // updateOne - returns internal field $setOnInsert
    await launchesDatabase.findOneAndUpdate({
        flightNumber: launch.flightNumber
    }, launch, { upsert: true })
}


async function scheduleNewLaunch(launch) {
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
    existLaunchWithId,
    getAllLaunches,
    scheduleNewLaunch,
    abortLaunchById
};