const Logger = require('@naturacosmeticos/clio-nodejs-logger');
const request = require('supertest');

const expressAppBuilder = require('../../src/express/app-builder');

describe('expressAppBuilder', () => {
  it('builds a working expressApp', async () => {
    Logger.supressOutput = true;
    const app = expressAppBuilder();

    app.expressApp.get('/test', (req, res) => res.status(302).end());

    await request(app.expressApp).get('/test').expect(302);
  });
});
