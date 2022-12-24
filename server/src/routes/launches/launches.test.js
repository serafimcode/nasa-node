const request = require('supertest');
const app = require('../../app');
const { mongoConnect, mongoDisconnect } = require('../../utils/mongo');

/**TODO think of mocking DB*/
describe('Launches API', () => {
    const URL = '/v1/launches';

    beforeAll(async () => {
        await mongoConnect()
    });

    afterAll(async () => {
        await mongoDisconnect();
    })

    describe('Test GET /launches', () => {
        test('It should respond with 200 success', async () => {
            await request(app)
                .get(URL)
                .expect(200)
        });
    });

    describe('Test POST /launches', () => {
        const completeLaunchData = {
            mission: 'USS Enterprise',
            rocket: 'NCC 1701-D',
            target: 'Kepler-62 f',
            launchDate: 'January 4, 2028',
        }
        const launchDataWithoutDate = {
            mission: 'USS Enterprise',
            rocket: 'NCC 1701-D',
            target: 'Kepler-62 f',
        }
        const launchDataWithInvalidDate = {
            mission: 'USS Enterprise',
            rocket: 'NCC 1701-D',
            target: 'Kepler-62 f',
            launchDate: 'not a date',
        }

        test('It should respond with 200 success', async () => {
            const response = await request(app)
                .post(URL)
                .send(completeLaunchData)
                .expect(201);

            const requestDate = new Date(completeLaunchData.launchDate).valueOf();
            const responseDate = new Date(response.body.launchDate).valueOf();

            expect(responseDate).toBe(requestDate);
            expect(response.body).toMatchObject(launchDataWithoutDate);
        })

        test('It should catch missing required properties', async () => {
            const response = await request(app)
                .post(URL)
                .send(launchDataWithoutDate)
                .expect(400);

            expect(response.body).toStrictEqual({
                error: 'Missing required launch property',
            })
        })
        test('It should catch invalid dates', async () => {
            const response = await request(app)
                .post(URL)
                .send(launchDataWithInvalidDate)
                .expect(400);

            expect(response.body).toStrictEqual({
                error: 'Invalid launch date'
            })
        })
    })
})