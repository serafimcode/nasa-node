const launches = new Map();

let latestFlightNumber = 100;

const launch = {
    flightNumber: 100,
    mission: 'Kepler Exploration X',
    rocket: 'Explorer IS1',
    launchDate: new Date('December 27, 2030'),
    target: 'Kepler-422 b',
    customer: ['NASA', 'Facebook'],
    upcoming: true,
    success: true
}

launches.set(launch.flightNumber, launch);

function existLaunchWithId(launchId) {
    return launches.has(launchId);
}
function getAllLaunches() {
    return Array.from(launches.values());
}

function addNewLaunch(launch) {
    latestFlightNumber++;
    launches.set(
        latestFlightNumber,
        Object.assign(launch, {
            success: true,
            upcoming: true,
            customer: ['Nasa', 'Facebook'],
            flightNumber: latestFlightNumber
        })
    );
}

function abortLaunchById(id) {
    const aborted = launches.get(id);
    aborted.upcoming = false;
    aborted.success = false;
    return aborted;
}

module.exports = {
    existLaunchWithId,
    getAllLaunches,
    addNewLaunch,
    abortLaunchById
};